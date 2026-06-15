package com.cinema.vncinema.scheduler;

import com.cinema.vncinema.dto.response.SeatStatusUpdateResponse;
import com.cinema.vncinema.entity.Movie;
import com.cinema.vncinema.entity.Ticket;
import com.cinema.vncinema.repository.MovieRepository;
import com.cinema.vncinema.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class JobScheduler {

    private final TicketRepository ticketRepository;
    private final MovieRepository movieRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Periodically checks for tickets that are PENDING and have expired (created > 10 minutes ago).
     * Automatically sets their status to CANCELLED and broadcasts the seat release via WebSocket.
     * Runs every 1 minute.
     */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void cancelExpiredPendingTickets() {
        LocalDateTime expirationTime = LocalDateTime.now().minusMinutes(10);
        List<Ticket> expiredTickets = ticketRepository.findByStatusAndCreatedAtBefore("PENDING", expirationTime);

        if (expiredTickets.isEmpty()) {
            return;
        }

        log.info("Found {} expired pending tickets. Cancelling them...", expiredTickets.size());

        for (Ticket ticket : expiredTickets) {
            ticket.setStatus("CANCELLED");
            ticketRepository.save(ticket);
        }

        // Group seats by showtimeId to broadcast in batches
        Map<Long, List<Long>> seatsByShowtime = expiredTickets.stream()
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

    /**
     * Periodically checks for UPCOMING movies whose releaseDate is today or in the past,
     * and automatically updates their status to NOW_SHOWING.
     * Runs every 5 minutes.
     */
    @Scheduled(fixedRate = 300000)
    @Transactional
    public void updateUpcomingMoviesToNowShowing() {
        List<Movie> upcomingMovies = movieRepository.findByStatus("UPCOMING");
        if (upcomingMovies.isEmpty()) {
            return;
        }

        LocalDate today = LocalDate.now();
        List<Movie> moviesToUpdate = upcomingMovies.stream()
                .filter(m -> m.getReleaseDate() != null && !m.getReleaseDate().isAfter(today))
                .collect(Collectors.toList());

        if (moviesToUpdate.isEmpty()) {
            return;
        }

        log.info("Found {} upcoming movies that should be showing. Updating status...", moviesToUpdate.size());

        for (Movie movie : moviesToUpdate) {
            movie.setStatus("NOW_SHOWING");
            movieRepository.save(movie);
            log.info("Movie '{}' (ID: {}) status updated to NOW_SHOWING", movie.getTitle(), movie.getId());
        }
    }
}
