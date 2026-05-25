package com.cinema.vncinema.service.impl;

import com.cinema.vncinema.dto.request.BookTicketsRequest;
import com.cinema.vncinema.dto.response.TicketResponse;
import com.cinema.vncinema.entity.*;
import com.cinema.vncinema.exception.AppException;
import com.cinema.vncinema.exception.ErrorCode;
import com.cinema.vncinema.repository.*;
import com.cinema.vncinema.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;
    private final SeatTypePriceRepository seatTypePriceRepository;
    private final UserRepository userRepository;
    private final StringRedisTemplate redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public List<TicketResponse> bookTickets(BookTicketsRequest request, String email) {
        Showtime showtime = showtimeRepository.findById(request.showtimeId())
                .orElseThrow(() -> new AppException(ErrorCode.SHOWTIME_NOT_FOUND));

        User user = null;
        if (email != null && !email.isEmpty() && !"anonymousUser".equals(email)) {
            user = userRepository.findByEmail(email).orElse(null);
        }

        // Fetch seat type prices surcharges map
        List<SeatTypePrice> surcharges = seatTypePriceRepository.findAll();
        Map<SeatType, BigDecimal> surchargeMap = surcharges.stream()
                .collect(Collectors.toMap(SeatTypePrice::getSeatType, SeatTypePrice::getSurcharge));

        // Fetch already booked seat IDs for this showtime
        List<Ticket> existingTickets = ticketRepository.findByShowtimeId(request.showtimeId());
        Set<Long> bookedSeatIds = existingTickets.stream()
                .filter(t -> "BOOKED".equalsIgnoreCase(t.getStatus()) || "PENDING".equalsIgnoreCase(t.getStatus()))
                .map(t -> t.getSeat().getId())
                .collect(Collectors.toSet());

        List<TicketResponse> responses = new ArrayList<>();

        for (Long seatId : request.seatIds()) {
            if (bookedSeatIds.contains(seatId)) {
                throw new AppException(ErrorCode.SEAT_ALREADY_BOOKED);
            }

            // Verify the seat is not held by another user in Redis
            String key = "seat:hold:" + request.showtimeId() + ":" + seatId;
            String heldToken = redisTemplate.opsForValue().get(key);
            if (heldToken != null && !heldToken.equals(request.bookingToken())) {
                throw new AppException(ErrorCode.SEAT_ALREADY_BOOKED);
            }

            Seat seat = seatRepository.findById(seatId)
                    .orElseThrow(() -> new AppException(ErrorCode.SEAT_NOT_FOUND));

            // Verify seat belongs to the screen room of the showtime
            if (!seat.getScreenRoom().getId().equals(showtime.getScreenRoom().getId())) {
                throw new AppException(ErrorCode.INVALID_ROOM_SEAT_CONFIGURATION);
            }

            BigDecimal surcharge = surchargeMap.getOrDefault(seat.getSeatType(), BigDecimal.ZERO);
            BigDecimal price = showtime.getBasePrice().add(surcharge);

            Ticket ticket = Ticket.builder()
                    .showtime(showtime)
                    .seat(seat)
                    .user(user)
                    .price(price)
                    .status("BOOKED") // Directly book it for simple demo booking flow
                    .build();

            Ticket saved = ticketRepository.save(ticket);
            responses.add(new TicketResponse(
                    saved.getId(),
                    saved.getShowtime().getId(),
                    saved.getSeat().getId(),
                    saved.getSeat().getRowName() + saved.getSeat().getSeatNumber(),
                    saved.getPrice(),
                    saved.getStatus()
            ));

            // Clean up hold key in Redis since it is now booked
            redisTemplate.delete(key);
        }

        // Broadcast to WebSocket that these seats are now booked
        com.cinema.vncinema.dto.response.SeatStatusUpdateResponse broadcastMsg = 
                new com.cinema.vncinema.dto.response.SeatStatusUpdateResponse(
                        request.showtimeId(),
                        request.seatIds(),
                        "booked",
                        request.bookingToken()
                );
        messagingTemplate.convertAndSend("/topic/showtimes/" + request.showtimeId() + "/seats", broadcastMsg);

        return responses;
    }
}
