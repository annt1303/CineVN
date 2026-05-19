package com.cinema.vncinema.repository;

import com.cinema.vncinema.entity.ScreenRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScreenRoomRepository extends JpaRepository<ScreenRoom, Long> {
    List<ScreenRoom> findByCinemaId(Long cinemaId);
    boolean existsByNameAndCinemaId(String name, Long cinemaId);
}
