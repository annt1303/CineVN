package com.cinema.vncinema.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String ORDER_EXCHANGE = "cinema.orders.exchange";
    public static final String DLQ_EXCHANGE = "cinema.dlq.exchange";

    public static final String EMAIL_QUEUE = "queue.ticket.email";
    public static final String EMAIL_DLQ_QUEUE = "queue.ticket.email.dlq";

    public static final String EMAIL_ROUTING_KEY = "order.email";
    public static final String EMAIL_DLQ_ROUTING_KEY = "dlq.email";

    @Bean
    public TopicExchange orderExchange() {
        return new TopicExchange(ORDER_EXCHANGE);
    }

    @Bean
    public DirectExchange dlqExchange() {
        return new DirectExchange(DLQ_EXCHANGE);
    }

    @Bean
    public Queue emailQueue() {
        return QueueBuilder.durable(EMAIL_QUEUE)
                .withArgument("x-dead-letter-exchange", DLQ_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", EMAIL_DLQ_ROUTING_KEY)
                .build();
    }

    @Bean
    public Queue emailDlqQueue() {
        return QueueBuilder.durable(EMAIL_DLQ_QUEUE).build();
    }

    @Bean
    public Binding emailBinding(Queue emailQueue, TopicExchange orderExchange) {
        return BindingBuilder.bind(emailQueue).to(orderExchange).with(EMAIL_ROUTING_KEY);
    }

    @Bean
    public Binding dlqBinding(Queue emailDlqQueue, DirectExchange dlqExchange) {
        return BindingBuilder.bind(emailDlqQueue).to(dlqExchange).with(EMAIL_DLQ_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
