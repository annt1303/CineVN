package com.cinema.vncinema.messaging.producer;

import com.cinema.vncinema.config.RabbitMQConfig;
import com.cinema.vncinema.messaging.message.TicketEmailMessage;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class OrderEventPublisherTest {

    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private OrderEventPublisher orderEventPublisher;

    @Test
    void publishTicketEmailEvent_shouldSendToCorrectExchangeAndRoutingKey() {
        // given
        TicketEmailMessage msg = new TicketEmailMessage(
                "user@test.com", "TIC-ABC123", "Inception",
                "CGV Landmark", "Room 1", LocalDateTime.now(),
                "A1, A2", 2, new BigDecimal("240000"), "MoMo"
        );

        // when
        orderEventPublisher.publishTicketEmailEvent(msg);

        // then
        verify(rabbitTemplate).convertAndSend(
                eq(RabbitMQConfig.ORDER_EXCHANGE),
                eq(RabbitMQConfig.EMAIL_ROUTING_KEY),
                eq(msg)
        );
    }
}
