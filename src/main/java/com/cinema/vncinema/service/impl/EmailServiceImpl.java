package com.cinema.vncinema.service.impl;

import com.cinema.vncinema.dto.TicketEmailDto;
import com.cinema.vncinema.service.EmailService;
import jakarta.annotation.PostConstruct;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${mail.from}")
    private String fromEmail;

    @Value("classpath:templates/ticket-email.html")
    private Resource ticketEmailTemplateResource;

    private String ticketEmailTemplate;

    private static final DateTimeFormatter DATETIME_FORMATTER =
            DateTimeFormatter.ofPattern("HH:mm - dd/MM/yyyy");

    @PostConstruct
    public void init() {
        try {
            this.ticketEmailTemplate = StreamUtils.copyToString(
                    ticketEmailTemplateResource.getInputStream(),
                    StandardCharsets.UTF_8
            );
            log.info("Successfully loaded ticket confirmation email template.");
        } catch (IOException e) {
            log.error("Failed to load ticket email template, using minimal fallback.", e);
            this.ticketEmailTemplate = "<p>Booking confirmed. Code: {{BOOKING_CODE}}</p>";
        }
    }

    @Override
    @Async
    public void sendTicketConfirmationEmail(String toEmail, TicketEmailDto emailDto) {
        if (emailDto == null) {
            log.warn("sendTicketConfirmationEmail called with null emailDto, skipping.");
            return;
        }

        try {
            String bookingCode = emailDto.bookingCode();
            String seatList = emailDto.seatList();
            BigDecimal total = emailDto.totalPrice();
            String movieTitle  = emailDto.movieTitle();
            String cinemaName  = emailDto.cinemaName();
            String roomName    = emailDto.roomName();
            String showtimeStr = emailDto.startTime().format(DATETIME_FORMATTER);
            String paymentMethod = emailDto.paymentMethod() != null ? emailDto.paymentMethod() : "Online";
            int ticketCount = emailDto.ticketCount();

            // Format total as VND
            String totalFormatted = String.format("%,.0f VND", total);

            // QR code data: compact JSON-like string for the QR scanner
            String qrData = String.format(
                    "VNCinema|%s|%s|%s|%s|%s|%s",
                    bookingCode, movieTitle, cinemaName, roomName, showtimeStr, seatList
            );
            // URL-encode the QR data
            String encodedQr = java.net.URLEncoder.encode(qrData, StandardCharsets.UTF_8);
            String qrImageUrl = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + encodedQr;

            // Replace placeholders in HTML template
            String html = ticketEmailTemplate
                    .replace("{{BOOKING_CODE}}",   bookingCode)
                    .replace("{{MOVIE_TITLE}}",    movieTitle)
                    .replace("{{CINEMA_NAME}}",    cinemaName)
                    .replace("{{ROOM_NAME}}",      roomName)
                    .replace("{{SHOWTIME}}",       showtimeStr)
                    .replace("{{SEAT_LIST}}",      seatList)
                    .replace("{{TICKET_COUNT}}",   String.valueOf(ticketCount))
                    .replace("{{TOTAL_PRICE}}",    totalFormatted)
                    .replace("{{PAYMENT_METHOD}}", paymentMethod)
                    .replace("{{QR_CODE_URL}}",    qrImageUrl);

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("[CineVN] Xác nhận đặt vé thành công – Mã: " + bookingCode);
            helper.setText(html, true);

            mailSender.send(mimeMessage);
            log.info("Ticket confirmation email sent to {} for booking {}", toEmail, bookingCode);

        } catch (MessagingException e) {
            // Non-blocking: log but do NOT throw, so the booking API call still returns success
            log.error("Failed to send ticket confirmation email to {} for booking {}",
                    toEmail, emailDto.bookingCode(), e);
        } catch (Exception e) {
            log.error("Unexpected error when sending ticket email for booking {}", emailDto.bookingCode(), e);
        }
    }
}
