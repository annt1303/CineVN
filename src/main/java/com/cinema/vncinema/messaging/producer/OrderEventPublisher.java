package com.cinema.vncinema.messaging.producer;

import com.cinema.vncinema.config.RabbitMQConfig;
import com.cinema.vncinema.messaging.message.TicketEmailMessage;
import com.cinema.vncinema.messaging.message.TicketExpirationMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishTicketEmailEvent(TicketEmailMessage message) {
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.ORDER_EXCHANGE,
                RabbitMQConfig.EMAIL_ROUTING_KEY,
                message
        );
        log.info("Published ticket email event for booking: {}", message.bookingCode());
    }

    public void publishTicketExpirationHoldEvent(TicketExpirationMessage message) {
        rabbitTemplate.convertAndSend(
                "",
                RabbitMQConfig.EXPIRATION_HOLD_QUEUE,
                message
        );
        log.info("Published ticket expiration hold event for booking: {}", message.bookingCode());
    }
}
