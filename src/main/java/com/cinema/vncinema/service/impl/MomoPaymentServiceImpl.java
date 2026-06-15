package com.cinema.vncinema.service.impl;

import com.cinema.vncinema.config.MomoConfig;
import com.cinema.vncinema.dto.request.MomoIpnRequest;
import com.cinema.vncinema.dto.response.MomoPaymentVerificationResponse;
import com.cinema.vncinema.entity.Ticket;
import com.cinema.vncinema.exception.AppException;
import com.cinema.vncinema.exception.ErrorCode;
import com.cinema.vncinema.repository.TicketRepository;
import com.cinema.vncinema.service.MomoPaymentService;
import com.cinema.vncinema.service.TicketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MomoPaymentServiceImpl implements MomoPaymentService {

    private final MomoConfig momoConfig;
    private final TicketRepository ticketRepository;
    private final TicketService ticketService;
    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    @Transactional
    public String createPayment(String bookingCode) {
        List<Ticket> tickets = ticketRepository.findByBookingCode(bookingCode);
        if (tickets.isEmpty()) {
            throw new AppException(ErrorCode.TICKET_NOT_FOUND);
        }

        // Validate that all tickets are PENDING
        boolean allPending = tickets.stream().allMatch(t -> "PENDING".equalsIgnoreCase(t.getStatus()));
        if (!allPending) {
            throw new AppException(ErrorCode.BOOKING_ALREADY_PROCESSED);
        }

        // Calculate total price
        BigDecimal totalPrice = tickets.stream()
                .map(Ticket::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long amount = totalPrice.longValue();
        String requestId = UUID.randomUUID().toString();
        String orderId = bookingCode;
        String orderInfo = "Thanh toan ve xem phim CineVN, Ma booking: " + bookingCode;
        String extraData = ""; // Can be empty string

        // Create raw signature
        // format: accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
        String rawSignature = "accessKey=" + momoConfig.getAccessKey() +
                "&amount=" + amount +
                "&extraData=" + extraData +
                "&ipnUrl=" + momoConfig.getIpnUrl() +
                "&orderId=" + orderId +
                "&orderInfo=" + orderInfo +
                "&partnerCode=" + momoConfig.getPartnerCode() +
                "&redirectUrl=" + momoConfig.getRedirectUrl() +
                "&requestId=" + requestId +
                "&requestType=captureWallet";

        String signature = hmacSha256(rawSignature, momoConfig.getSecretKey());

        // Call MoMo API
        String url = momoConfig.getApiUrl() + "/v2/gateway/api/create";
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("partnerCode", momoConfig.getPartnerCode());
        requestBody.put("partnerName", "CineVN");
        requestBody.put("storeId", "CineVN");
        requestBody.put("requestId", requestId);
        requestBody.put("amount", amount);
        requestBody.put("orderId", orderId);
        requestBody.put("orderInfo", orderInfo);
        requestBody.put("redirectUrl", momoConfig.getRedirectUrl());
        requestBody.put("ipnUrl", momoConfig.getIpnUrl());
        requestBody.put("extraData", extraData);
        requestBody.put("requestType", "captureWallet");
        requestBody.put("signature", signature);

        log.info("Sending payment request to MoMo for booking: {}, amount: {}", bookingCode, amount);
        try {
            Map<String, Object> response = restTemplate.postForObject(url, requestBody, Map.class);
            if (response != null && Integer.valueOf(0).equals(response.get("resultCode"))) {
                return (String) response.get("payUrl");
            } else {
                String message = response != null ? (String) response.get("message") : "Empty response";
                log.error("MoMo payment creation failed: {}", message);
                throw new AppException(ErrorCode.MOMO_PAYMENT_CREATION_FAILED);
            }
        } catch (Exception e) {
            log.error("Exception occurred while calling MoMo API", e);
            throw new AppException(ErrorCode.MOMO_PAYMENT_CREATION_FAILED);
        }
    }

    @Override
    @Transactional
    public MomoPaymentVerificationResponse verifyPayment(String bookingCode) {
        List<Ticket> tickets = ticketRepository.findByBookingCode(bookingCode);
        if (tickets.isEmpty()) {
            throw new AppException(ErrorCode.TICKET_NOT_FOUND);
        }

        Ticket firstTicket = tickets.get(0);
        String currentStatus = firstTicket.getStatus();

        // If tickets are already booked, return details immediately
        if ("BOOKED".equalsIgnoreCase(currentStatus)) {
            return buildVerificationResponse(tickets);
        }

        // If tickets are PENDING, query MoMo Transaction Status API
        if ("PENDING".equalsIgnoreCase(currentStatus)) {
            String requestId = UUID.randomUUID().toString();
            String rawSignature = "accessKey=" + momoConfig.getAccessKey() +
                    "&orderId=" + bookingCode +
                    "&partnerCode=" + momoConfig.getPartnerCode() +
                    "&requestId=" + requestId;

            String signature = hmacSha256(rawSignature, momoConfig.getSecretKey());

            String url = momoConfig.getApiUrl() + "/v2/gateway/api/query";
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("partnerCode", momoConfig.getPartnerCode());
            requestBody.put("requestId", requestId);
            requestBody.put("orderId", bookingCode);
            requestBody.put("lang", "vi");
            requestBody.put("signature", signature);

            log.info("Querying MoMo transaction status for booking: {}", bookingCode);
            try {
                Map<String, Object> response = restTemplate.postForObject(url, requestBody, Map.class);
                if (response != null) {
                    Integer resultCode = (Integer) response.get("resultCode");
                    log.info("MoMo query result code for booking {}: {}", bookingCode, resultCode);

                    if (Integer.valueOf(0).equals(resultCode)) {
                        // Confirm payment in DB
                        ticketService.confirmPayment(bookingCode);
                        // Refetch tickets to get updated state
                        tickets = ticketRepository.findByBookingCode(bookingCode);
                    } else if (resultCode != null && resultCode != 9000) { 
                        // Result code 9000 is usually transaction not found (still pending/waiting for user scanning),
                        // but other non-zero codes mean failures or cancels (e.g. timeout, user cancelled, etc.)
                        ticketService.cancelBooking(bookingCode);
                        tickets = ticketRepository.findByBookingCode(bookingCode);
                    }
                }
            } catch (Exception e) {
                log.error("Error querying MoMo transaction status", e);
            }
        }

        return buildVerificationResponse(tickets);
    }

    @Override
    @Transactional
    public void processIpn(MomoIpnRequest ipnRequest) {
        log.info("Processing MoMo IPN callback for booking: {}, resultCode: {}", ipnRequest.orderId(), ipnRequest.resultCode());

        // Validate signature
        // format: accessKey=$accessKey&amount=$amount&extraData=$extraData&message=$message&orderId=$orderId&orderInfo=$orderInfo&orderType=$orderType&partnerCode=$partnerCode&payType=$payType&requestId=$requestId&responseTime=$responseTime&resultCode=$resultCode&transId=$transId
        String rawSignature = "accessKey=" + momoConfig.getAccessKey() +
                "&amount=" + ipnRequest.amount() +
                "&extraData=" + (ipnRequest.extraData() != null ? ipnRequest.extraData() : "") +
                "&message=" + ipnRequest.message() +
                "&orderId=" + ipnRequest.orderId() +
                "&orderInfo=" + ipnRequest.orderInfo() +
                "&orderType=" + ipnRequest.orderType() +
                "&partnerCode=" + ipnRequest.partnerCode() +
                "&payType=" + ipnRequest.payType() +
                "&requestId=" + ipnRequest.requestId() +
                "&responseTime=" + ipnRequest.responseTime() +
                "&resultCode=" + ipnRequest.resultCode() +
                "&transId=" + ipnRequest.transId();

        String expectedSignature = hmacSha256(rawSignature, momoConfig.getSecretKey());
        if (!expectedSignature.equals(ipnRequest.signature())) {
            log.error("Invalid MoMo signature in IPN payload! Expected: {}, received: {}", expectedSignature, ipnRequest.signature());
            throw new AppException(ErrorCode.MOMO_PAYMENT_SIGNATURE_INVALID);
        }

        // Handle transaction status
        if (Integer.valueOf(0).equals(ipnRequest.resultCode())) {
            // Confirm tickets
            ticketService.confirmPayment(ipnRequest.orderId());
        } else {
            // Cancel booking and free seats
            ticketService.cancelBooking(ipnRequest.orderId());
        }
    }

    private MomoPaymentVerificationResponse buildVerificationResponse(List<Ticket> tickets) {
        Ticket first = tickets.get(0);
        List<String> seats = tickets.stream()
                .map(t -> t.getSeat().getRowName() + t.getSeat().getSeatNumber())
                .collect(Collectors.toList());

        BigDecimal total = tickets.stream()
                .map(Ticket::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new MomoPaymentVerificationResponse(
                first.getBookingCode(),
                first.getShowtime().getMovie().getTitle(),
                first.getShowtime().getScreenRoom().getCinema().getName(),
                first.getShowtime().getScreenRoom().getName(),
                first.getShowtime().getStartTime(),
                seats,
                total,
                first.getPaymentMethod(),
                first.getStatus(),
                first.getUser() != null ? first.getUser().getEmail() : null
        );
    }

    private String hmacSha256(String data, String key) {
        try {
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(secretKeySpec);
            byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(rawHmac);
        } catch (Exception e) {
            throw new RuntimeException("Failed to calculate hmac-sha256 signature", e);
        }
    }
}
