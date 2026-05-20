package com.cinema.vncinema.repository;

import com.cinema.vncinema.entity.BasePriceConfig;
import com.cinema.vncinema.entity.MovieFormat;
import com.cinema.vncinema.entity.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BasePriceConfigRepository extends JpaRepository<BasePriceConfig, Long> {
    Optional<BasePriceConfig> findByRoomTypeAndMovieFormatAndIsWeekendAndTimeSlot(
        RoomType roomType, 
        MovieFormat movieFormat, 
        Boolean isWeekend, 
        String timeSlot
    );
}
