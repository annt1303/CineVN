package com.cinema.vncinema.repository;

import com.cinema.vncinema.entity.SeatType;
import com.cinema.vncinema.entity.SeatTypePrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SeatTypePriceRepository extends JpaRepository<SeatTypePrice, Long> {
    Optional<SeatTypePrice> findBySeatType(SeatType seatType);
}
