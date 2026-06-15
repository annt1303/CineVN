package com.cinema.vncinema.controller.public_;

import com.cinema.vncinema.dto.request.MomoIpnRequest;
import com.cinema.vncinema.dto.response.ApiResponse;
import com.cinema.vncinema.dto.response.MomoPaymentVerificationResponse;
import com.cinema.vncinema.service.MomoPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/payment/momo")
@RequiredArgsConstructor
public class PublicMomoPaymentController {

    private final MomoPaymentService momoPaymentService;

    @PostMapping("/create")
    public ApiResponse<String> createPayment(@RequestParam String bookingCode) {
        String payUrl = momoPaymentService.createPayment(bookingCode);
        return ApiResponse.success("TẠO ĐƠN HÀNG THANH TOÁN MOMO THÀNH CÔNG!", payUrl);
    }

    @PostMapping("/ipn")
    public ResponseEntity<Void> processIpn(@RequestBody MomoIpnRequest ipnRequest) {
        momoPaymentService.processIpn(ipnRequest);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/verify")
    public ApiResponse<MomoPaymentVerificationResponse> verifyPayment(@RequestParam String bookingCode) {
        MomoPaymentVerificationResponse response = momoPaymentService.verifyPayment(bookingCode);
        return ApiResponse.success("XÁC MINH GIAO DỊCH MOMO THÀNH CÔNG!", response);
    }
}
