package com.cinema.vncinema.service.impl;

import com.cinema.vncinema.dto.request.SeatHoldRequest;
import com.cinema.vncinema.dto.response.SeatStatusUpdateResponse;
import com.cinema.vncinema.entity.Ticket;
import com.cinema.vncinema.exception.AppException;
import com.cinema.vncinema.exception.ErrorCode;
import com.cinema.vncinema.repository.TicketRepository;
import com.cinema.vncinema.service.SeatHoldService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SeatHoldServiceImpl implements SeatHoldService {

    private final StringRedisTemplate redisTemplate;
    private final TicketRepository ticketRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private static final String SEAT_HOLD_KEY_PREFIX = "seat:hold:";
    private static final long HOLD_TTL_MINUTES = 5;

    @Override
    public void holdSeats(Long showtimeId, SeatHoldRequest request) {
        String bookingToken = request.bookingToken();
        List<Long> seatIds = request.seatIds();

        // 1. Check if any seat is already booked in database
        List<Ticket> existingTickets = ticketRepository.findByShowtimeId(showtimeId);
        Set<Long> bookedSeatIds = existingTickets.stream()
                .filter(t -> "BOOKED".equalsIgnoreCase(t.getStatus()) || "PENDING".equalsIgnoreCase(t.getStatus()))
                .map(t -> t.getSeat().getId())
                .collect(Collectors.toSet());

        for (Long seatId : seatIds) {
            if (bookedSeatIds.contains(seatId)) {
                throw new AppException(ErrorCode.SEAT_ALREADY_BOOKED);
            }
        }

        // 2. Try to lock in Redis
        List<Long> successfullyHeld = new ArrayList<>();
        try {
            for (Long seatId : seatIds) {
                String key = getRedisKey(showtimeId, seatId);
                // SETNX check
                Boolean success = redisTemplate.opsForValue().setIfAbsent(key, bookingToken, HOLD_TTL_MINUTES, TimeUnit.MINUTES);
                
                if (Boolean.TRUE.equals(success)) {
                    successfullyHeld.add(seatId);
                } else {
                    // Check if it's already held by the same token (keep alive / refresh hold)
                    String existingToken = redisTemplate.opsForValue().get(key);
                    if (bookingToken.equals(existingToken)) {
                        redisTemplate.expire(key, HOLD_TTL_MINUTES, TimeUnit.MINUTES);
                        successfullyHeld.add(seatId);
                    } else {
                        throw new AppException(ErrorCode.SEAT_ALREADY_BOOKED);
                    }
                }
            }
        } catch (AppException e) {
            // Rollback any successfully held seats in this batch
            for (Long seatId : successfullyHeld) {
                redisTemplate.delete(getRedisKey(showtimeId, seatId));
            }
            throw e;
        }

        // 3. Broadcast status update via WebSocket
        broadcastSeatStatus(showtimeId, seatIds, "held", bookingToken);
    }

    @Override
    public void releaseSeats(Long showtimeId, SeatHoldRequest request) {
        String bookingToken = request.bookingToken();
        List<Long> seatIds = request.seatIds();
        List<Long> releasedSeatIds = new ArrayList<>();

        for (Long seatId : seatIds) {
            String key = getRedisKey(showtimeId, seatId);
            String existingToken = redisTemplate.opsForValue().get(key);
            if (bookingToken.equals(existingToken)) {
                redisTemplate.delete(key);
                releasedSeatIds.add(seatId);
            }
        }

        if (!releasedSeatIds.isEmpty()) {
            broadcastSeatStatus(showtimeId, releasedSeatIds, "available", bookingToken);
        }
    }

    @Override
    public List<Long> getHeldSeatIds(Long showtimeId) {
        String pattern = SEAT_HOLD_KEY_PREFIX + showtimeId + ":*";
        Set<String> keys = redisTemplate.keys(pattern);
        if (keys == null) {
            return List.of();
        }
        return keys.stream()
                .map(key -> {
                    String[] parts = key.split(":");
                    return Long.parseLong(parts[parts.length - 1]);
                })
                .collect(Collectors.toList());
    }

    @Override
    public String getSeatHoldToken(Long showtimeId, Long seatId) {
        return redisTemplate.opsForValue().get(getRedisKey(showtimeId, seatId));
    }

    private String getRedisKey(Long showtimeId, Long seatId) {
        return SEAT_HOLD_KEY_PREFIX + showtimeId + ":" + seatId;
    }

    private void broadcastSeatStatus(Long showtimeId, List<Long> seatIds, String status, String bookingToken) {
        SeatStatusUpdateResponse message = new SeatStatusUpdateResponse(showtimeId, seatIds, status, bookingToken);
        messagingTemplate.convertAndSend("/topic/showtimes/" + showtimeId + "/seats", message);
    }
}
