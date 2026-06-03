package com.cinema.vncinema.service;

import com.cinema.vncinema.dto.request.ShowtimeRequest;
import com.cinema.vncinema.dto.response.ShowtimeResponse;
import com.cinema.vncinema.entity.*;
import com.cinema.vncinema.exception.AppException;
import com.cinema.vncinema.exception.ErrorCode;
import com.cinema.vncinema.mapper.ShowtimeMapper;
import com.cinema.vncinema.repository.*;
import com.cinema.vncinema.service.impl.ShowtimeServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ShowtimeServiceTest {

    @Mock
    private ShowtimeRepository showtimeRepository;
    @Mock
    private MovieRepository movieRepository;
    @Mock
    private ScreenRoomRepository screenRoomRepository;
    @Mock
    private SeatRepository seatRepository;
    @Mock
    private TicketRepository ticketRepository;
    @Mock
    private SeatTypePriceRepository seatTypePriceRepository;
    @Mock
    private PricingService pricingService;
    @Mock
    private ShowtimeMapper showtimeMapper;

    @InjectMocks
    private ShowtimeServiceImpl showtimeService;

    @Test
    public void testCreateShowtime_Success() {
        LocalDateTime startTime = LocalDateTime.of(2026, 5, 25, 14, 0);
        ShowtimeRequest request = new ShowtimeRequest(
                1L, 1L, startTime, MovieFormat.FORMAT_2D, BigDecimal.valueOf(80000), true
        );

        Movie movie = Movie.builder().duration(120).title("Test Movie").build();
        movie.setId(1L);
        ScreenRoom room = ScreenRoom.builder().roomType(RoomType.STANDARD).name("Room 1").build();
        room.setId(1L);

        when(movieRepository.findById(1L)).thenReturn(Optional.of(movie));
        when(screenRoomRepository.findById(1L)).thenReturn(Optional.of(room));

        // Mock overlap check returning empty list
        LocalDateTime checkStartTime = startTime.minusMinutes(20);
        LocalDateTime checkEndTime = startTime.plusMinutes(120).plusMinutes(20); // 120m duration + 20m buffer
        when(showtimeRepository.findOverlappingShowtimes(1L, checkStartTime, checkEndTime, null))
                .thenReturn(List.of());

        Showtime showtime = Showtime.builder()
                .movie(movie)
                .screenRoom(room)
                .startTime(startTime)
                .endTime(startTime.plusMinutes(120))
                .movieFormat(MovieFormat.FORMAT_2D)
                .basePrice(BigDecimal.valueOf(80000))
                .isActive(true)
                .build();
        showtime.setId(1L);

        when(showtimeMapper.toShowtime(request)).thenReturn(showtime);
        when(showtimeRepository.save(showtime)).thenReturn(showtime);
        
        ShowtimeResponse response = ShowtimeResponse.builder()
                .id(1L)
                .movieId(1L)
                .movieTitle("Test Movie")
                .screenRoomId(1L)
                .screenRoomName("Room 1")
                .startTime(startTime)
                .endTime(startTime.plusMinutes(120))
                .movieFormat(MovieFormat.FORMAT_2D)
                .basePrice(BigDecimal.valueOf(80000))
                .isActive(true)
                .build();
        when(showtimeMapper.toShowtimeResponse(showtime)).thenReturn(response);

        ShowtimeResponse result = showtimeService.createShowtime(request);

        assertNotNull(result);
        assertEquals("Test Movie", result.movieTitle());
        assertEquals(BigDecimal.valueOf(80000), result.basePrice());
        verify(showtimeRepository, times(1)).save(showtime);
    }

    @Test
    public void testCreateShowtime_OverlapThrowsException() {
        LocalDateTime startTime = LocalDateTime.of(2026, 5, 25, 14, 0);
        ShowtimeRequest request = new ShowtimeRequest(
                1L, 1L, startTime, MovieFormat.FORMAT_2D, BigDecimal.valueOf(80000), true
        );

        Movie movie = Movie.builder().duration(120).title("Test Movie").build();
        movie.setId(1L);
        ScreenRoom room = ScreenRoom.builder().roomType(RoomType.STANDARD).name("Room 1").build();
        room.setId(1L);

        when(movieRepository.findById(1L)).thenReturn(Optional.of(movie));
        when(screenRoomRepository.findById(1L)).thenReturn(Optional.of(room));

        // Mock overlap check returning an existing showtime (overlap!)
        LocalDateTime checkStartTime = startTime.minusMinutes(20);
        LocalDateTime checkEndTime = startTime.plusMinutes(120).plusMinutes(20);
        Showtime existing = Showtime.builder().build();
        existing.setId(99L);
        when(showtimeRepository.findOverlappingShowtimes(1L, checkStartTime, checkEndTime, null))
                .thenReturn(List.of(existing));

        AppException ex = assertThrows(AppException.class, () -> {
            showtimeService.createShowtime(request);
        });

        assertEquals(ErrorCode.SHOWTIME_OVERLAP, ex.getErrorCode());
        verify(showtimeRepository, never()).save(any());
    }

}
