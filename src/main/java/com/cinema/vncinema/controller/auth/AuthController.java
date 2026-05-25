package com.cinema.vncinema.controller.auth;

import com.cinema.vncinema.constant.AuthMessages;
import com.cinema.vncinema.dto.request.LoginRequest;
import com.cinema.vncinema.dto.request.OtpSendRequest;
import com.cinema.vncinema.dto.request.OtpVerifyRequest;
import com.cinema.vncinema.dto.request.RegisterRequest;
import com.cinema.vncinema.dto.response.ApiResponse;
import com.cinema.vncinema.dto.response.LoginResponse;
import com.cinema.vncinema.dto.response.UserResponse;
import com.cinema.vncinema.exception.AppException;
import com.cinema.vncinema.exception.ErrorCode;
import com.cinema.vncinema.service.AuthService;
import com.cinema.vncinema.service.OtpService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final OtpService otpService;

    @PostMapping("/otp/send")
    public ApiResponse<Void> sendOtp(@Valid @RequestBody OtpSendRequest request) {
        otpService.sendOtp(request.email());
        return ApiResponse.success(AuthMessages.OTP_SENT);
    }

    @PostMapping("/otp/verify")
    public ApiResponse<Void> verifyOtp(@Valid @RequestBody OtpVerifyRequest request) {
        otpService.verifyOtp(request.email(), request.otpCode());
        return ApiResponse.success(AuthMessages.OTP_VERIFIED);
    }

    @PostMapping("/register")
    public ApiResponse<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse response = authService.register(request);
        return ApiResponse.success(AuthMessages.REGISTER_SUCCESS, response);
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        LoginResponse loginResponse = authService.login(request);
        setRefreshTokenCookie(response, loginResponse.refreshToken());
        return ApiResponse.success(AuthMessages.LOGIN_SUCCESS, loginResponse);
    }

    @PostMapping("/refresh")
    public ApiResponse<LoginResponse> refresh(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = getRefreshTokenFromCookies(request);
        if (refreshToken == null) {
            throw new AppException(ErrorCode.REFRESH_TOKEN_EXPIRED);
        }

        LoginResponse loginResponse = authService.refresh(refreshToken);
        setRefreshTokenCookie(response, loginResponse.refreshToken());
        return ApiResponse.success(AuthMessages.REFRESH_SUCCESS, loginResponse);
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = null;
        if (authentication != null) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
                email = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
            } else if (principal instanceof String && !"anonymousUser".equals(principal)) {
                email = (String) principal;
            }
        }
        if (email != null) {
            authService.logout(email);
        }
        clearRefreshTokenCookie(response);
        SecurityContextHolder.clearContext();
        return ApiResponse.success(AuthMessages.LOGOUT_SUCCESS);
    }

    @GetMapping("/me")
    public ApiResponse<UserResponse> getMe() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        Object principal = authentication.getPrincipal();
        String email = null;
        if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
            email = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
        } else if (principal instanceof String && !"anonymousUser".equals(principal)) {
            email = (String) principal;
        }
        
        if (email == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        UserResponse response = authService.getProfile(email);
        return ApiResponse.success(AuthMessages.PROFILE_SUCCESS, response);
    }


    private void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false) // Set to true in production with HTTPS
                .path("/")
                .maxAge(7 * 24 * 60 * 60) // 7 days in seconds
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearRefreshTokenCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private String getRefreshTokenFromCookies(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return null;
        }
        return Arrays.stream(request.getCookies())
                .filter(cookie -> "refreshToken".equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }
}
