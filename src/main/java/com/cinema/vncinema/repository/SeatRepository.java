package com.cinema.vncinema.repository;

import com.cinema.vncinema.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findByScreenRoomId(Long screenRoomId);
    @Modifying
    @Query("DELETE FROM Seat s WHERE s.screenRoom.id = :screenRoomId")
    void deleteByScreenRoomId(Long screenRoomId);
}
