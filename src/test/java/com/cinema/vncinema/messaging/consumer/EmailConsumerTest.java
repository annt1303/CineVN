package com.cinema.vncinema.messaging.consumer;

import com.cinema.vncinema.dto.TicketEmailDto;
import com.cinema.vncinema.messaging.message.TicketEmailMessage;
import com.cinema.vncinema.service.EmailService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailConsumerTest {

    @Mock
    private EmailService emailService;

    @InjectMocks
    private EmailConsumer emailConsumer;

    @Test
    void handleTicketEmailEvent_shouldCallEmailService() {
        // given
        TicketEmailMessage msg = new TicketEmailMessage(
                "user@test.com", "TIC-ABC123", "Inception",
                "CGV Landmark", "Room 1", LocalDateTime.now(),
                "A1, A2", 2, new BigDecimal("240000"), "MoMo"
        );

        // when
        emailConsumer.handleTicketEmailEvent(msg);

        // then
        verify(emailService, times(1))
                .sendTicketConfirmationEmail(eq("user@test.com"), any(TicketEmailDto.class));
    }

    @Test
    void handleTicketEmailEvent_whenEmailServiceThrows_shouldPropagateForRetry() {
        // given
        TicketEmailMessage msg = new TicketEmailMessage(
                "user@test.com", "TIC-ABC123", "Inception",
                "CGV Landmark", "Room 1", LocalDateTime.now(),
                "A1, A2", 2, new BigDecimal("240000"), "MoMo"
        );
        doThrow(new RuntimeException("SMTP down"))
                .when(emailService).sendTicketConfirmationEmail(any(), any());

        // when & then
        assertThrows(RuntimeException.class, () -> emailConsumer.handleTicketEmailEvent(msg));
    }
}
