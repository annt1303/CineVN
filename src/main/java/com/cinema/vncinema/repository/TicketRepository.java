package com.cinema.vncinema.repository;

import com.cinema.vncinema.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByShowtimeId(Long showtimeId);
    List<Ticket> findByBookingCode(String bookingCode);
    List<Ticket> findByStatusAndCreatedAtBefore(String status, LocalDateTime dateTime);
    List<Ticket> findByUserIdOrderByCreatedAtDesc(Long userId);
}
