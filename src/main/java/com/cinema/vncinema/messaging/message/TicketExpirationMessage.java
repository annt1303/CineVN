package com.cinema.vncinema.messaging.message;

public record TicketExpirationMessage(
    String bookingCode
) {}
