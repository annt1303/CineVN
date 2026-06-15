package com.cinema.vncinema.controller.public_;

import com.cinema.vncinema.constant.AuthMessages;
import com.cinema.vncinema.dto.request.ChangePasswordRequest;
import com.cinema.vncinema.dto.request.UpdateProfileRequest;
import com.cinema.vncinema.dto.response.ApiResponse;
import com.cinema.vncinema.dto.response.UpdateProfileResponse;
import com.cinema.vncinema.exception.AppException;
import com.cinema.vncinema.exception.ErrorCode;
import com.cinema.vncinema.constant.TicketMessages;
import com.cinema.vncinema.dto.response.PurchaseHistoryResponse;
import com.cinema.vncinema.service.UserService;
import com.cinema.vncinema.service.TicketService;
import java.util.List;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final TicketService ticketService;

    @PutMapping("/profile")
    public ApiResponse<UpdateProfileResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            HttpServletResponse response
    ) {
        String email = getAuthenticatedEmail();
        UpdateProfileResponse updated = userService.updateProfile(email, request);
        
        if (updated.refreshToken() != null) {
            setRefreshTokenCookie(response, updated.refreshToken());
        }
        
        return ApiResponse.success(AuthMessages.UPDATE_PROFILE_SUCCESS, updated);
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

    @GetMapping("/tickets")
    public ApiResponse<List<PurchaseHistoryResponse>> getPurchaseHistory() {
        String email = getAuthenticatedEmail();
        List<PurchaseHistoryResponse> history = ticketService.getPurchaseHistory(email);
        return ApiResponse.success(TicketMessages.GET_PURCHASE_HISTORY_SUCCESS, history);
    }

    @PutMapping("/change-password")
    public ApiResponse<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        String email = getAuthenticatedEmail();
        userService.changePassword(email, request);
        return ApiResponse.success(AuthMessages.CHANGE_PASSWORD_SUCCESS);
    }

    private String getAuthenticatedEmail() {
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
        return email;
    }
}

