package com.cinema.vncinema.service;

import com.cinema.vncinema.dto.request.MomoIpnRequest;
import com.cinema.vncinema.dto.response.MomoPaymentVerificationResponse;

public interface MomoPaymentService {
    String createPayment(String bookingCode);
    MomoPaymentVerificationResponse verifyPayment(String bookingCode);
    void processIpn(MomoIpnRequest ipnRequest);
}
