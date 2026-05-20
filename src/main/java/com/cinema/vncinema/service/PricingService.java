package com.cinema.vncinema.service;

import com.cinema.vncinema.dto.request.BasePriceConfigRequest;
import com.cinema.vncinema.dto.request.SeatTypePriceRequest;
import com.cinema.vncinema.dto.response.BasePriceConfigResponse;
import com.cinema.vncinema.dto.response.SeatTypePriceResponse;
import com.cinema.vncinema.entity.MovieFormat;
import com.cinema.vncinema.entity.RoomType;
import com.cinema.vncinema.entity.SeatType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface PricingService {

    // Helper methods for price computation rules
    boolean isWeekend(LocalDateTime dateTime);
    String determineTimeSlot(LocalDateTime dateTime);
    BigDecimal calculateBasePrice(RoomType roomType, MovieFormat format, LocalDateTime startTime);
    BigDecimal calculateTicketPrice(Long showtimeId, Long seatId);

    // BasePriceConfig CRUD
    BasePriceConfigResponse createBasePriceConfig(BasePriceConfigRequest request);
    BasePriceConfigResponse getBasePriceConfigById(Long id);
    List<BasePriceConfigResponse> getAllBasePriceConfigs();
    BasePriceConfigResponse updateBasePriceConfig(Long id, BasePriceConfigRequest request);
    void deleteBasePriceConfig(Long id);

    // SeatTypePrice CRUD/Management
    List<SeatTypePriceResponse> getAllSeatTypePrices();
    SeatTypePriceResponse updateSeatTypePrice(Long id, SeatTypePriceRequest request);
    SeatTypePriceResponse getSeatTypePriceBySeatType(SeatType seatType);
}
