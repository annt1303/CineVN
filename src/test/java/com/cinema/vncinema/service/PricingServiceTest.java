package com.cinema.vncinema.service;

import com.cinema.vncinema.entity.*;
import com.cinema.vncinema.repository.BasePriceConfigRepository;
import com.cinema.vncinema.repository.SeatRepository;
import com.cinema.vncinema.repository.SeatTypePriceRepository;
import com.cinema.vncinema.repository.ShowtimeRepository;
import com.cinema.vncinema.service.impl.PricingServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PricingServiceTest {

    @Mock
    private BasePriceConfigRepository basePriceConfigRepository;
    @Mock
    private SeatTypePriceRepository seatTypePriceRepository;
    @Mock
    private ShowtimeRepository showtimeRepository;
    @Mock
    private SeatRepository seatRepository;

    @InjectMocks
    private PricingServiceImpl pricingService;

    @Test
    public void testIsWeekend() {
        // Saturday: 2026-05-23
        LocalDateTime saturday = LocalDateTime.of(2026, 5, 23, 12, 0);
        assertTrue(pricingService.isWeekend(saturday));

        // Sunday: 2026-05-24
        LocalDateTime sunday = LocalDateTime.of(2026, 5, 24, 12, 0);
        assertTrue(pricingService.isWeekend(sunday));

        // Monday: 2026-05-25
        LocalDateTime monday = LocalDateTime.of(2026, 5, 25, 12, 0);
        assertFalse(pricingService.isWeekend(monday));
    }

    @Test
    public void testDetermineTimeSlot() {
        // 16:59 -> DAYTIME
        LocalDateTime daytime = LocalDateTime.of(2026, 5, 25, 16, 59);
        assertEquals("DAYTIME", pricingService.determineTimeSlot(daytime));

        // 17:00 -> EVENING
        LocalDateTime evening = LocalDateTime.of(2026, 5, 25, 17, 0);
        assertEquals("EVENING", pricingService.determineTimeSlot(evening));
    }

    @Test
    public void testCalculateBasePrice_Found() {
        LocalDateTime time = LocalDateTime.of(2026, 5, 25, 18, 0); // Monday (weekday), Evening
        RoomType roomType = RoomType.STANDARD;
        MovieFormat format = MovieFormat.FORMAT_2D;

        BasePriceConfig mockConfig = BasePriceConfig.builder()
                .roomType(roomType)
                .movieFormat(format)
                .isWeekend(false)
                .timeSlot("EVENING")
                .basePrice(BigDecimal.valueOf(85000))
                .build();

        when(basePriceConfigRepository.findByRoomTypeAndMovieFormatAndIsWeekendAndTimeSlot(roomType, format, false, "EVENING"))
                .thenReturn(Optional.of(mockConfig));

        BigDecimal result = pricingService.calculateBasePrice(roomType, format, time);
        assertEquals(BigDecimal.valueOf(85000), result);
    }

    @Test
    public void testCalculateBasePrice_Fallback() {
        LocalDateTime time = LocalDateTime.of(2026, 5, 25, 18, 0);
        RoomType roomType = RoomType.STANDARD;
        MovieFormat format = MovieFormat.FORMAT_2D;

        when(basePriceConfigRepository.findByRoomTypeAndMovieFormatAndIsWeekendAndTimeSlot(roomType, format, false, "EVENING"))
                .thenReturn(Optional.empty());

        BigDecimal result = pricingService.calculateBasePrice(roomType, format, time);
        assertEquals(BigDecimal.valueOf(70000.0), result); // fallback price
    }
}
