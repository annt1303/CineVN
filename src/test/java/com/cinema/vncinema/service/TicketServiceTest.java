package com.cinema.vncinema.service;

import com.cinema.vncinema.dto.request.BookTicketsRequest;
import com.cinema.vncinema.dto.response.TicketResponse;
import com.cinema.vncinema.entity.*;
import com.cinema.vncinema.exception.AppException;
import com.cinema.vncinema.exception.ErrorCode;
import com.cinema.vncinema.repository.*;
import com.cinema.vncinema.service.impl.TicketServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TicketServiceTest {

    @Mock
    private TicketRepository ticketRepository;
    @Mock
    private ShowtimeRepository showtimeRepository;
    @Mock
    private SeatRepository seatRepository;
    @Mock
    private SeatTypePriceRepository seatTypePriceRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private StringRedisTemplate redisTemplate;
    @Mock
    private SimpMessagingTemplate messagingTemplate;
    @Mock
    private EmailService emailService;
    @Mock
    private SeatHoldService seatHoldService;

    @InjectMocks
    private TicketServiceImpl ticketService;

    @Mock
    private org.springframework.data.redis.core.ValueOperations<String, String> valueOperations;

    @org.junit.jupiter.api.BeforeEach
    public void setUp() {
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        lenient().when(valueOperations.setIfAbsent(anyString(), anyString(), anyLong(), any(java.util.concurrent.TimeUnit.class)))
                .thenReturn(true);
    }

    @Test
    public void testBookTickets_Success() {
        Long showtimeId = 1L;
        Long seatId = 10L;
        String token = "booking-token-123";
        BookTicketsRequest request = new BookTicketsRequest(showtimeId, List.of(seatId), token, "MOMO");

        Showtime showtime = Showtime.builder()
                .basePrice(BigDecimal.valueOf(80000))
                .movie(Movie.builder().title("Movie Title").build())
                .screenRoom(ScreenRoom.builder().cinema(Cinema.builder().name("Cinema Name").build()).name("Room 1").build())
                .build();
        showtime.setId(showtimeId);
        showtime.getScreenRoom().setId(5L);

        Seat seat = Seat.builder()
                .seatType(SeatType.NORMAL)
                .rowName("A")
                .seatNumber(5)
                .screenRoom(showtime.getScreenRoom())
                .build();
        seat.setId(seatId);

        // Mocks
        when(showtimeRepository.findById(showtimeId)).thenReturn(Optional.of(showtime));
        when(seatHoldService.claimSeatHold(showtimeId, seatId, token)).thenReturn(true);
        when(seatTypePriceRepository.findAll()).thenReturn(List.of());
        when(ticketRepository.findByShowtimeId(showtimeId)).thenReturn(List.of());
        when(seatRepository.findById(seatId)).thenReturn(Optional.of(seat));

        Ticket ticket = Ticket.builder()
                .showtime(showtime)
                .seat(seat)
                .price(BigDecimal.valueOf(80000))
                .status("BOOKED")
                .bookingCode("TIC-ABC123")
                .paymentMethod("MOMO")
                .build();
        when(ticketRepository.save(any(Ticket.class))).thenReturn(ticket);

        // Run
        List<TicketResponse> responses = ticketService.bookTickets(request, "user@example.com");

        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals("A5", responses.get(0).seatName());

        // Verify claims
        verify(seatHoldService, times(1)).claimSeatHold(showtimeId, seatId, token);
        verify(seatHoldService, never()).revertSeatHold(anyLong(), anyLong(), anyString());
    }

    @Test
    public void testBookTickets_ClaimHoldFailure_RollsBackHolds() {
        Long showtimeId = 1L;
        Long seat1 = 10L;
        Long seat2 = 11L;
        String token = "booking-token-123";
        BookTicketsRequest request = new BookTicketsRequest(showtimeId, List.of(seat1, seat2), token, "MOMO");

        Showtime showtime = Showtime.builder()
                .basePrice(BigDecimal.valueOf(80000))
                .build();
        showtime.setId(showtimeId);

        // Mocks: seat1 succeeds, seat2 fails to claim
        when(showtimeRepository.findById(showtimeId)).thenReturn(Optional.of(showtime));
        when(seatHoldService.claimSeatHold(showtimeId, seat1, token)).thenReturn(true);
        when(seatHoldService.claimSeatHold(showtimeId, seat2, token)).thenReturn(false);

        // Run and expect exception
        AppException exception = assertThrows(AppException.class, () -> {
            ticketService.bookTickets(request, "user@example.com");
        });

        assertEquals(ErrorCode.SEAT_ALREADY_BOOKED, exception.getErrorCode());

        // Verify we reverted seat1 hold but didn't attempt to save tickets
        verify(seatHoldService, times(1)).claimSeatHold(showtimeId, seat1, token);
        verify(seatHoldService, times(1)).claimSeatHold(showtimeId, seat2, token);
        verify(seatHoldService, times(1)).revertSeatHold(showtimeId, seat1, token);
        verify(ticketRepository, never()).save(any());
    }
}
