package com.cinema.vncinema.service;

import com.cinema.vncinema.dto.TicketEmailDto;

/**
 * Service interface for sending transactional emails.
 */
public interface EmailService {

    /**
     * Sends a booking confirmation email with a QR code to the user.
     *
     * @param toEmail  Recipient email address.
     * @param emailDto DTO containing pre-fetched ticket and booking details.
     */
    void sendTicketConfirmationEmail(String toEmail, TicketEmailDto emailDto);
}
