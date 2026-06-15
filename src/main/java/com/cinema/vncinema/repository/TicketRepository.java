package com.cinema.vncinema.repository;

import com.cinema.vncinema.entity.Ticket;
import com.cinema.vncinema.dto.response.MovieRevenueResponse;
import com.cinema.vncinema.dto.response.CinemaRevenueResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
        List<Ticket> findByShowtimeId(Long showtimeId);

        List<Ticket> findByBookingCode(String bookingCode);

        List<Ticket> findByStatusAndCreatedAtBefore(String status, LocalDateTime dateTime);

        List<Ticket> findByUserIdOrderByCreatedAtDesc(Long userId);

        // ── Report queries ──

        @Query("SELECT COALESCE(SUM(t.price), 0) FROM Ticket t WHERE t.status = 'BOOKED'")
        BigDecimal getTotalRevenue();

        @Query("SELECT COUNT(t) FROM Ticket t WHERE t.status = 'BOOKED'")
        long getTotalTicketsSold();

        @Query("SELECT new com.cinema.vncinema.dto.response.MovieRevenueResponse(" +
                        "m.id, m.title, COUNT(t), COALESCE(SUM(t.price), 0)) " +
                        "FROM Ticket t JOIN t.showtime s JOIN s.movie m " +
                        "WHERE t.status = 'BOOKED' AND t.createdAt >= :startDate AND t.createdAt <= :endDate " +
                        "GROUP BY m.id, m.title ORDER BY SUM(t.price) DESC")
        List<MovieRevenueResponse> getMovieRevenueReport(
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        @Query("SELECT new com.cinema.vncinema.dto.response.CinemaRevenueResponse(" +
                        "c.id, c.name, COUNT(t), COALESCE(SUM(t.price), 0)) " +
                        "FROM Ticket t JOIN t.showtime s JOIN s.screenRoom sr JOIN sr.cinema c " +
                        "WHERE t.status = 'BOOKED' AND t.createdAt >= :startDate AND t.createdAt <= :endDate " +
                        "GROUP BY c.id, c.name ORDER BY SUM(t.price) DESC")
        List<CinemaRevenueResponse> getCinemaRevenueReport(
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        @Query(value = "SELECT CAST(created_at AS DATE) as date_val, " +
                        "COUNT(id) as ticket_count, " +
                        "COALESCE(SUM(price), 0) as revenue " +
                        "FROM tickets " +
                        "WHERE status = 'BOOKED' AND created_at >= :startDate AND created_at <= :endDate " +
                        "GROUP BY CAST(created_at AS DATE) " +
                        "ORDER BY date_val ASC", nativeQuery = true)
        List<Object[]> getDailyRevenueReport(
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);
}
