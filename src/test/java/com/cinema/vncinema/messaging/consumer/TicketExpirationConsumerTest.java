package com.cinema.vncinema.messaging.consumer;

import com.cinema.vncinema.entity.Seat;
import com.cinema.vncinema.entity.Showtime;
import com.cinema.vncinema.entity.Ticket;
import com.cinema.vncinema.messaging.message.TicketExpirationMessage;
import com.cinema.vncinema.repository.TicketRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketExpirationConsumerTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private TicketExpirationConsumer ticketExpirationConsumer;

    @Test
    void handleTicketExpirationEvent_whenNoTicketsFound_shouldDoNothing() {
        // given
        TicketExpirationMessage msg = new TicketExpirationMessage("TIC-EXPIRED");
        when(ticketRepository.findByBookingCode("TIC-EXPIRED")).thenReturn(Collections.emptyList());

        // when
        ticketExpirationConsumer.handleTicketExpirationEvent(msg);

        // then
        verify(ticketRepository, never()).save(any());
        verify(messagingTemplate, never()).convertAndSend(anyString(), any(Object.class));
    }

    @Test
    void handleTicketExpirationEvent_whenTicketsAreAlreadyBooked_shouldDoNothing() {
        // given
        TicketExpirationMessage msg = new TicketExpirationMessage("TIC-BOOKED");
        Ticket ticket = new Ticket();
        ticket.setStatus("BOOKED");
        when(ticketRepository.findByBookingCode("TIC-BOOKED")).thenReturn(List.of(ticket));

        // when
        ticketExpirationConsumer.handleTicketExpirationEvent(msg);

        // then
        verify(ticketRepository, never()).save(any());
        verify(messagingTemplate, never()).convertAndSend(anyString(), any(Object.class));
    }

    @Test
    void handleTicketExpirationEvent_whenTicketsArePending_shouldCancelAndBroadcast() {
        // given
        TicketExpirationMessage msg = new TicketExpirationMessage("TIC-PENDING");

        Showtime showtime = new Showtime();
        showtime.setId(1L);

        Seat seat = new Seat();
        seat.setId(2L);

        Ticket ticket = Ticket.builder()
                .status("PENDING")
                .showtime(showtime)
                .seat(seat)
                .build();

        when(ticketRepository.findByBookingCode("TIC-PENDING")).thenReturn(List.of(ticket));

        // when
        ticketExpirationConsumer.handleTicketExpirationEvent(msg);

        // then
        verify(ticketRepository, times(1)).save(ticket);
        assertEquals("CANCELLED", ticket.getStatus());
        verify(messagingTemplate, times(1))
                .convertAndSend(eq("/topic/showtimes/1/seats"), any(Object.class));
    }
}
