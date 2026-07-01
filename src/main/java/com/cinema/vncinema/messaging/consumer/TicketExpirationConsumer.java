package com.cinema.vncinema.messaging.consumer;

import com.cinema.vncinema.config.RabbitMQConfig;
import com.cinema.vncinema.dto.response.SeatStatusUpdateResponse;
import com.cinema.vncinema.entity.Ticket;
import com.cinema.vncinema.messaging.message.TicketExpirationMessage;
import com.cinema.vncinema.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class TicketExpirationConsumer {

    private final TicketRepository ticketRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @RabbitListener(queues = RabbitMQConfig.TICKET_CANCEL_QUEUE)
    @Transactional
    public void handleTicketExpirationEvent(TicketExpirationMessage message) {
        log.info("Consuming ticket expiration event for booking: {}", message.bookingCode());

        List<Ticket> tickets = ticketRepository.findByBookingCode(message.bookingCode());
        if (tickets.isEmpty()) {
            log.info("No tickets found for booking code: {}", message.bookingCode());
            return;
        }

        // Check if any ticket is still PENDING. If not, the booking is already confirmed/cancelled.
        boolean hasPending = tickets.stream().anyMatch(t -> "PENDING".equalsIgnoreCase(t.getStatus()));
        if (!hasPending) {
            log.info("Booking {} is already processed (BOOKED/CANCELLED). Skipping expiration.", message.bookingCode());
            return;
        }

        log.info("Booking {} has expired. Cancelling tickets and releasing seats...", message.bookingCode());
        for (Ticket ticket : tickets) {
            if ("PENDING".equalsIgnoreCase(ticket.getStatus())) {
                ticket.setStatus("CANCELLED");
                ticketRepository.save(ticket);
            }
        }

        // Group seats by showtimeId to broadcast via WebSocket
        Map<Long, List<Long>> seatsByShowtime = tickets.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getShowtime().getId(),
                        Collectors.mapping(t -> t.getSeat().getId(), Collectors.toList())
                ));

        for (Map.Entry<Long, List<Long>> entry : seatsByShowtime.entrySet()) {
            Long showtimeId = entry.getKey();
            List<Long> seatIds = entry.getValue();

            log.info("Broadcasting release of seats {} for showtime {}", seatIds, showtimeId);

            SeatStatusUpdateResponse broadcastMsg = new SeatStatusUpdateResponse(
                    showtimeId,
                    seatIds,
                    "available",
                    null
            );

            try {
                messagingTemplate.convertAndSend("/topic/showtimes/" + showtimeId + "/seats", broadcastMsg);
            } catch (Exception e) {
                log.error("Failed to broadcast seat status update via WebSocket for showtime: {}", showtimeId, e);
            }
        }
    }
}
