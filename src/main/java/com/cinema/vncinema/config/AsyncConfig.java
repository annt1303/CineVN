package com.cinema.vncinema.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Enables Spring's asynchronous method execution (@Async), used by EmailServiceImpl
 * to send ticket-confirmation emails in the background without blocking the HTTP response.
 */
@Configuration
@EnableAsync
public class AsyncConfig {
}
