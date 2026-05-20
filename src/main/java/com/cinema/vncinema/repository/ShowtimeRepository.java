package com.cinema.vncinema.repository;

import com.cinema.vncinema.entity.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {

    List<Showtime> findByMovieIdAndStartTimeBetweenAndIsActiveTrue(Long movieId, LocalDateTime start, LocalDateTime end);

    List<Showtime> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT s FROM Showtime s WHERE s.screenRoom.id = :screenRoomId " +
           "AND s.isActive = true " +
           "AND s.startTime < :endTime " +
           "AND s.endTime > :startTime " +
           "AND (:excludeId IS NULL OR s.id <> :excludeId)")
    List<Showtime> findOverlappingShowtimes(
        @Param("screenRoomId") Long screenRoomId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime,
        @Param("excludeId") Long excludeId
    );
}
