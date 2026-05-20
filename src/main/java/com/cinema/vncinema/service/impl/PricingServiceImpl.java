package com.cinema.vncinema.service.impl;

import com.cinema.vncinema.dto.request.BasePriceConfigRequest;
import com.cinema.vncinema.dto.request.SeatTypePriceRequest;
import com.cinema.vncinema.dto.response.BasePriceConfigResponse;
import com.cinema.vncinema.dto.response.SeatTypePriceResponse;
import com.cinema.vncinema.entity.*;
import com.cinema.vncinema.exception.AppException;
import com.cinema.vncinema.exception.ErrorCode;
import com.cinema.vncinema.mapper.BasePriceConfigMapper;
import com.cinema.vncinema.mapper.SeatTypePriceMapper;
import com.cinema.vncinema.repository.BasePriceConfigRepository;
import com.cinema.vncinema.repository.SeatRepository;
import com.cinema.vncinema.repository.SeatTypePriceRepository;
import com.cinema.vncinema.repository.ShowtimeRepository;
import com.cinema.vncinema.service.PricingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PricingServiceImpl implements PricingService {

    private final BasePriceConfigRepository basePriceConfigRepository;
    private final SeatTypePriceRepository seatTypePriceRepository;
    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;
    
    private final BasePriceConfigMapper basePriceConfigMapper;
    private final SeatTypePriceMapper seatTypePriceMapper;

    @Override
    public boolean isWeekend(LocalDateTime dateTime) {
        DayOfWeek day = dateTime.getDayOfWeek();
        return day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY;
    }

    @Override
    public String determineTimeSlot(LocalDateTime dateTime) {
        return dateTime.getHour() < 17 ? "DAYTIME" : "EVENING";
    }

    @Override
    public BigDecimal calculateBasePrice(RoomType roomType, MovieFormat format, LocalDateTime startTime) {
        boolean weekend = isWeekend(startTime);
        String slot = determineTimeSlot(startTime);
        return basePriceConfigRepository.findByRoomTypeAndMovieFormatAndIsWeekendAndTimeSlot(roomType, format, weekend, slot)
                .map(BasePriceConfig::getBasePrice)
                .orElse(BigDecimal.valueOf(70000.0)); // Fallback: 70,000 VND
    }

    @Override
    public BigDecimal calculateTicketPrice(Long showtimeId, Long seatId) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new AppException(ErrorCode.SHOWTIME_NOT_FOUND));
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new AppException(ErrorCode.SEAT_NOT_FOUND));
        
        BigDecimal surcharge = seatTypePriceRepository.findBySeatType(seat.getSeatType())
                .map(SeatTypePrice::getSurcharge)
                .orElse(BigDecimal.ZERO);
                
        return showtime.getBasePrice().add(surcharge);
    }

    // =========================================================================
    // BasePriceConfig CRUD
    // =========================================================================

    @Override
    @Transactional
    public BasePriceConfigResponse createBasePriceConfig(BasePriceConfigRequest request) {
        var existing = basePriceConfigRepository.findByRoomTypeAndMovieFormatAndIsWeekendAndTimeSlot(
                request.roomType(), request.movieFormat(), request.isWeekend(), request.timeSlot()
        );
        if (existing.isPresent()) {
            throw new AppException(ErrorCode.INVALID_ARGUMENT);
        }

        BasePriceConfig config = basePriceConfigMapper.toBasePriceConfig(request);
        BasePriceConfig saved = basePriceConfigRepository.save(config);
        return basePriceConfigMapper.toBasePriceConfigResponse(saved);
    }

    @Override
    public BasePriceConfigResponse getBasePriceConfigById(Long id) {
        BasePriceConfig config = basePriceConfigRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRICE_CONFIG_NOT_FOUND));
        return basePriceConfigMapper.toBasePriceConfigResponse(config);
    }

    @Override
    public List<BasePriceConfigResponse> getAllBasePriceConfigs() {
        return basePriceConfigRepository.findAll().stream()
                .map(basePriceConfigMapper::toBasePriceConfigResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BasePriceConfigResponse updateBasePriceConfig(Long id, BasePriceConfigRequest request) {
        BasePriceConfig config = basePriceConfigRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRICE_CONFIG_NOT_FOUND));

        // Check if criteria changes overlap with an existing different configuration
        var duplicate = basePriceConfigRepository.findByRoomTypeAndMovieFormatAndIsWeekendAndTimeSlot(
                request.roomType(), request.movieFormat(), request.isWeekend(), request.timeSlot()
        );
        if (duplicate.isPresent() && !duplicate.get().getId().equals(id)) {
            throw new AppException(ErrorCode.INVALID_ARGUMENT);
        }

        config.setRoomType(request.roomType());
        config.setMovieFormat(request.movieFormat());
        config.setIsWeekend(request.isWeekend());
        config.setTimeSlot(request.timeSlot());
        config.setBasePrice(request.basePrice());

        BasePriceConfig saved = basePriceConfigRepository.save(config);
        return basePriceConfigMapper.toBasePriceConfigResponse(saved);
    }

    @Override
    @Transactional
    public void deleteBasePriceConfig(Long id) {
        if (!basePriceConfigRepository.existsById(id)) {
            throw new AppException(ErrorCode.PRICE_CONFIG_NOT_FOUND);
        }
        basePriceConfigRepository.deleteById(id);
    }

    // =========================================================================
    // SeatTypePrice CRUD/Management
    // =========================================================================

    @Override
    public List<SeatTypePriceResponse> getAllSeatTypePrices() {
        return seatTypePriceRepository.findAll().stream()
                .map(seatTypePriceMapper::toSeatTypePriceResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SeatTypePriceResponse updateSeatTypePrice(Long id, SeatTypePriceRequest request) {
        SeatTypePrice price = seatTypePriceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SEAT_TYPE_PRICE_NOT_FOUND));

        price.setSurcharge(request.surcharge());
        SeatTypePrice saved = seatTypePriceRepository.save(price);
        return seatTypePriceMapper.toSeatTypePriceResponse(saved);
    }

    @Override
    public SeatTypePriceResponse getSeatTypePriceBySeatType(SeatType seatType) {
        SeatTypePrice price = seatTypePriceRepository.findBySeatType(seatType)
                .orElseThrow(() -> new AppException(ErrorCode.SEAT_TYPE_PRICE_NOT_FOUND));
        return seatTypePriceMapper.toSeatTypePriceResponse(price);
    }
}
