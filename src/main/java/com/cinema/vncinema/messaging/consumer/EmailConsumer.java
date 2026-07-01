package com.cinema.vncinema.messaging.consumer;

import com.cinema.vncinema.config.RabbitMQConfig;
import com.cinema.vncinema.dto.TicketEmailDto;
import com.cinema.vncinema.messaging.message.TicketEmailMessage;
import com.cinema.vncinema.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailConsumer {

    private final EmailService emailService;

    @RabbitListener(queues = RabbitMQConfig.EMAIL_QUEUE)
    public void handleTicketEmailEvent(TicketEmailMessage message) {
        log.info("Consuming ticket email event for booking: {}", message.bookingCode());

        TicketEmailDto dto = new TicketEmailDto(
                message.bookingCode(),
                message.movieTitle(),
                message.cinemaName(),
                message.roomName(),
                message.startTime(),
                message.seatList(),
                message.ticketCount(),
                message.totalPrice(),
                message.paymentMethod()
        );

        emailService.sendTicketConfirmationEmail(message.toEmail(), dto);
    }
}
