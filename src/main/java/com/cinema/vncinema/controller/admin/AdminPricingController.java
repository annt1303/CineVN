package com.cinema.vncinema.controller.admin;

import com.cinema.vncinema.constant.PriceMessages;
import com.cinema.vncinema.dto.request.BasePriceConfigRequest;
import com.cinema.vncinema.dto.request.SeatTypePriceRequest;
import com.cinema.vncinema.dto.response.ApiResponse;
import com.cinema.vncinema.dto.response.BasePriceConfigResponse;
import com.cinema.vncinema.dto.response.SeatTypePriceResponse;
import com.cinema.vncinema.service.PricingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/pricing")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminPricingController {

    private final PricingService pricingService;

    // =========================================================================
    // Base Price Configurations Matrix Endpoints
    // =========================================================================

    @PostMapping("/base-price-configs")
    public ApiResponse<BasePriceConfigResponse> createBasePriceConfig(
            @Valid @RequestBody BasePriceConfigRequest request) {
        BasePriceConfigResponse response = pricingService.createBasePriceConfig(request);
        return ApiResponse.success(PriceMessages.CREATE_CONFIG_SUCCESS, response);
    }

    @GetMapping("/base-price-configs")
    public ApiResponse<List<BasePriceConfigResponse>> getAllBasePriceConfigs() {
        List<BasePriceConfigResponse> response = pricingService.getAllBasePriceConfigs();
        return ApiResponse.success(PriceMessages.GET_ALL_CONFIGS_SUCCESS, response);
    }

    @GetMapping("/base-price-configs/{id}")
    public ApiResponse<BasePriceConfigResponse> getBasePriceConfigById(@PathVariable Long id) {
        BasePriceConfigResponse response = pricingService.getBasePriceConfigById(id);
        return ApiResponse.success(PriceMessages.GET_CONFIG_SUCCESS, response);
    }

    @PutMapping("/base-price-configs/{id}")
    public ApiResponse<BasePriceConfigResponse> updateBasePriceConfig(
            @PathVariable Long id,
            @Valid @RequestBody BasePriceConfigRequest request) {
        BasePriceConfigResponse response = pricingService.updateBasePriceConfig(id, request);
        return ApiResponse.success(PriceMessages.UPDATE_CONFIG_SUCCESS, response);
    }

    @DeleteMapping("/base-price-configs/{id}")
    public ApiResponse<Void> deleteBasePriceConfig(@PathVariable Long id) {
        pricingService.deleteBasePriceConfig(id);
        return ApiResponse.success(PriceMessages.DELETE_CONFIG_SUCCESS);
    }

    // =========================================================================
    // Seat Type Prices Surcharges Endpoints
    // =========================================================================

    @GetMapping("/seat-type-prices")
    public ApiResponse<List<SeatTypePriceResponse>> getAllSeatTypePrices() {
        List<SeatTypePriceResponse> response = pricingService.getAllSeatTypePrices();
        return ApiResponse.success(PriceMessages.GET_SEAT_PRICES_SUCCESS, response);
    }

    @PutMapping("/seat-type-prices/{id}")
    public ApiResponse<SeatTypePriceResponse> updateSeatTypePrice(
            @PathVariable Long id,
            @Valid @RequestBody SeatTypePriceRequest request) {
        SeatTypePriceResponse response = pricingService.updateSeatTypePrice(id, request);
        return ApiResponse.success(PriceMessages.UPDATE_SEAT_PRICE_SUCCESS, response);
    }
}
