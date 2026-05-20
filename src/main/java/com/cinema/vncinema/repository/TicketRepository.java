package com.cinema.vncinema.repository;

import com.cinema.vncinema.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByShowtimeId(Long showtimeId);
}
