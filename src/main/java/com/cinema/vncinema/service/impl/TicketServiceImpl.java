package com.cinema.vncinema.service.impl;

import com.cinema.vncinema.dto.request.BookTicketsRequest;
import com.cinema.vncinema.dto.response.TicketResponse;
import com.cinema.vncinema.dto.TicketEmailDto;
import com.cinema.vncinema.entity.*;
import com.cinema.vncinema.exception.AppException;
import com.cinema.vncinema.exception.ErrorCode;
import com.cinema.vncinema.repository.*;
import com.cinema.vncinema.service.EmailService;
import com.cinema.vncinema.service.TicketService;
import com.cinema.vncinema.service.SeatHoldService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;
    private final SeatTypePriceRepository seatTypePriceRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final EmailService emailService;
    private final SeatHoldService seatHoldService;
    private final StringRedisTemplate redisTemplate;

    private static final String BOOKING_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String BOOKING_LOCK_PREFIX = "booking:lock:";
    private static final long BOOKING_LOCK_TTL_SECONDS = 30;

    /** Generates a human-friendly booking code like "TIC-A3B9F2". */
    private String generateBookingCode() {
        StringBuilder sb = new StringBuilder("TIC-");
        for (int i = 0; i < 6; i++) {
            sb.append(BOOKING_CODE_CHARS.charAt(RANDOM.nextInt(BOOKING_CODE_CHARS.length())));
        }
        return sb.toString();
    }

    @Override
    @Transactional
    public List<TicketResponse> bookTickets(BookTicketsRequest request, String email) {
        // ── Idempotency guard: prevent duplicate booking from the same bookingToken ──
        String lockKey = BOOKING_LOCK_PREFIX + request.bookingToken();
        Boolean acquired = redisTemplate.opsForValue()
                .setIfAbsent(lockKey, "PROCESSING", BOOKING_LOCK_TTL_SECONDS, java.util.concurrent.TimeUnit.SECONDS);
        if (!Boolean.TRUE.equals(acquired)) {
            throw new AppException(ErrorCode.BOOKING_ALREADY_PROCESSED);
        }

        Showtime showtime = showtimeRepository.findById(request.showtimeId())
                .orElseThrow(() -> new AppException(ErrorCode.SHOWTIME_NOT_FOUND));

        // 1. Try to claim holds for all seats on Redis atomically.
        // If we fail to claim any seat, we throw SEAT_ALREADY_BOOKED and revert any successfully claimed seats.
        List<Long> claimedSeats = new ArrayList<>();
        try {
            for (Long seatId : request.seatIds()) {
                boolean claimed = seatHoldService.claimSeatHold(request.showtimeId(), seatId, request.bookingToken());
                if (!claimed) {
                    throw new AppException(ErrorCode.SEAT_ALREADY_BOOKED);
                }
                claimedSeats.add(seatId);
            }
        } catch (Exception e) {
            for (Long seatId : claimedSeats) {
                try {
                    seatHoldService.revertSeatHold(request.showtimeId(), seatId, request.bookingToken());
                } catch (Exception reex) {
                    log.error("Failed to revert seat hold for showtime: {}, seat: {}", request.showtimeId(), seatId, reex);
                }
            }
            // Release the idempotency lock so user can retry
            redisTemplate.delete(lockKey);
            throw e;
        }

        // Register transaction synchronization for final hold cleanup / revert
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    // Mark the lock as COMPLETED (keep it alive so retries are rejected)
                    redisTemplate.opsForValue().set(lockKey, "COMPLETED", 5, java.util.concurrent.TimeUnit.MINUTES);
                    cleanupSeatHoldsAndBroadcast(request);
                }

                @Override
                public void afterCompletion(int status) {
                    if (status == STATUS_ROLLED_BACK) {
                        // Release the lock on rollback so user can retry
                        redisTemplate.delete(lockKey);
                        revertSeatHolds(request);
                    }
                }
            });
        } else {
            // Fallback for non-transactional contexts (e.g. tests)
            cleanupSeatHoldsAndBroadcast(request);
        }

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

        // Shared booking code for all seats in this transaction
        String bookingCode = generateBookingCode();
        String paymentMethod = request.paymentMethod() != null ? request.paymentMethod() : "Online";

        List<Ticket> savedTickets = new ArrayList<>();
        List<TicketResponse> responses = new ArrayList<>();

        for (Long seatId : request.seatIds()) {
            if (bookedSeatIds.contains(seatId)) {
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
                    .status("PENDING")
                    .bookingCode(bookingCode)
                    .paymentMethod(paymentMethod)
                    .build();

            Ticket saved = ticketRepository.save(ticket);
            savedTickets.add(saved);

            responses.add(new TicketResponse(
                    saved.getId(),
                    saved.getShowtime().getId(),
                    saved.getSeat().getId(),
                    saved.getSeat().getRowName() + saved.getSeat().getSeatNumber(),
                    saved.getPrice(),
                    saved.getStatus(),
                    saved.getBookingCode(),
                    saved.getPaymentMethod()
            ));
        }

        return responses;
    }

    @Override
    @Transactional
    public List<TicketResponse> confirmPayment(String bookingCode) {
        List<Ticket> tickets = ticketRepository.findByBookingCode(bookingCode);
        if (tickets.isEmpty()) {
            throw new AppException(ErrorCode.TICKET_NOT_FOUND);
        }

        List<TicketResponse> responses = new ArrayList<>();
        List<Ticket> savedTickets = new ArrayList<>();

        for (Ticket ticket : tickets) {
            if ("BOOKED".equalsIgnoreCase(ticket.getStatus())) {
                responses.add(new TicketResponse(
                        ticket.getId(),
                        ticket.getShowtime().getId(),
                        ticket.getSeat().getId(),
                        ticket.getSeat().getRowName() + ticket.getSeat().getSeatNumber(),
                        ticket.getPrice(),
                        ticket.getStatus(),
                        ticket.getBookingCode(),
                        ticket.getPaymentMethod()
                ));
                savedTickets.add(ticket);
                continue;
            }

            if (!"PENDING".equalsIgnoreCase(ticket.getStatus())) {
                throw new AppException(ErrorCode.BOOKING_ALREADY_PROCESSED);
            }

            ticket.setStatus("BOOKED");
            Ticket saved = ticketRepository.save(ticket);
            savedTickets.add(saved);

            responses.add(new TicketResponse(
                    saved.getId(),
                    saved.getShowtime().getId(),
                    saved.getSeat().getId(),
                    saved.getSeat().getRowName() + saved.getSeat().getSeatNumber(),
                    saved.getPrice(),
                    saved.getStatus(),
                    saved.getBookingCode(),
                    saved.getPaymentMethod()
            ));
        }

        if (!savedTickets.isEmpty()) {
            Ticket firstTicket = savedTickets.get(0);
            User user = firstTicket.getUser();
            if (user != null && user.getEmail() != null) {
                String seatList = savedTickets.stream()
                        .map(t -> t.getSeat().getRowName() + t.getSeat().getSeatNumber())
                        .collect(Collectors.joining(", "));

                BigDecimal totalPrice = savedTickets.stream()
                        .map(Ticket::getPrice)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                TicketEmailDto emailDto = new TicketEmailDto(
                        bookingCode,
                        firstTicket.getShowtime().getMovie().getTitle(),
                        firstTicket.getShowtime().getScreenRoom().getCinema().getName(),
                        firstTicket.getShowtime().getScreenRoom().getName(),
                        firstTicket.getShowtime().getStartTime(),
                        seatList,
                        savedTickets.size(),
                        totalPrice,
                        firstTicket.getPaymentMethod()
                );

                emailService.sendTicketConfirmationEmail(user.getEmail(), emailDto);
                log.info("Async ticket confirmation email queued for {} (booking: {})", user.getEmail(), bookingCode);
            } else {
                log.info("No authenticated user – skipping email for booking {}", bookingCode);
            }
        }

        return responses;
    }

    private void cleanupSeatHoldsAndBroadcast(BookTicketsRequest request) {
        for (Long seatId : request.seatIds()) {
            try {
                seatHoldService.deleteSeatHold(request.showtimeId(), seatId);
            } catch (Exception ex) {
                log.error("Failed to delete seat hold key for showtime: {}, seat: {}", request.showtimeId(), seatId, ex);
            }
        }
        
        // Broadcast to WebSocket that these seats are now booked
        com.cinema.vncinema.dto.response.SeatStatusUpdateResponse broadcastMsg =
                new com.cinema.vncinema.dto.response.SeatStatusUpdateResponse(
                        request.showtimeId(),
                        request.seatIds(),
                        "booked",
                        request.bookingToken()
                );
        try {
            messagingTemplate.convertAndSend("/topic/showtimes/" + request.showtimeId() + "/seats", broadcastMsg);
        } catch (Exception ex) {
            log.error("Failed to broadcast seat status update via WebSocket", ex);
        }
    }

    private void revertSeatHolds(BookTicketsRequest request) {
        for (Long seatId : request.seatIds()) {
            try {
                seatHoldService.revertSeatHold(request.showtimeId(), seatId, request.bookingToken());
            } catch (Exception ex) {
                log.error("Failed to revert seat hold key for showtime: {}, seat: {}", request.showtimeId(), seatId, ex);
            }
        }
    }
}
