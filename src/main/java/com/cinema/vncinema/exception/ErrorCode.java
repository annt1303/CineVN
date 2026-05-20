package com.cinema.vncinema.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Invalid message key", HttpStatus.BAD_REQUEST),
    USER_EXISTED(1002, "User already exists", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(1003, "Username must be at least 3 characters", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(1004, "Password must be at least 8 characters", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1005, "User does not exist", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1006, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "You do not have permission to access this resource", HttpStatus.FORBIDDEN),
    RESOURCE_NOT_FOUND(1008, "Requested resource not found", HttpStatus.NOT_FOUND),
    INVALID_ARGUMENT(1009, "Invalid request argument", HttpStatus.BAD_REQUEST),
    INVALID_OTP(1010, "Invalid or expired OTP", HttpStatus.BAD_REQUEST),
    EMAIL_NOT_VERIFIED(1011, "Email has not been verified with OTP", HttpStatus.BAD_REQUEST),
    INVALID_CREDENTIALS(1012, "Incorrect email or password", HttpStatus.BAD_REQUEST),
    REFRESH_TOKEN_EXPIRED(1013, "Refresh token has expired, please log in again", HttpStatus.UNAUTHORIZED),
    INVALID_OLD_PASSWORD(1014, "Current password is incorrect", HttpStatus.BAD_REQUEST),
    SAME_PASSWORD(1015, "New password must be different from the current password", HttpStatus.BAD_REQUEST),
    CINEMA_EXISTED(1016, "Cinema with this name already exists", HttpStatus.BAD_REQUEST),
    CINEMA_NOT_FOUND(1017, "Cinema not found", HttpStatus.NOT_FOUND),
    ROOM_EXISTED(1018, "Screen room with this name already exists in this cinema", HttpStatus.BAD_REQUEST),
    ROOM_NOT_FOUND(1019, "Screen room not found", HttpStatus.NOT_FOUND),
    INVALID_ROOM_SEAT_CONFIGURATION(1020, "Invalid seat layout configuration", HttpStatus.BAD_REQUEST),
    MOVIE_EXISTED(1021, "Movie has already been imported", HttpStatus.BAD_REQUEST),
    MOVIE_NOT_FOUND(1022, "Movie not found", HttpStatus.NOT_FOUND),
    SHOWTIME_NOT_FOUND(1023, "Showtime not found", HttpStatus.NOT_FOUND),
    SHOWTIME_OVERLAP(1024, "Showtime overlaps with an existing screening in this room", HttpStatus.BAD_REQUEST),
    PRICE_CONFIG_NOT_FOUND(1025, "Pricing configuration not found", HttpStatus.NOT_FOUND),
    SEAT_TYPE_PRICE_NOT_FOUND(1026, "Seat type price configuration not found", HttpStatus.NOT_FOUND),
    TICKET_NOT_FOUND(1027, "Ticket not found", HttpStatus.NOT_FOUND),
    SEAT_NOT_FOUND(1028, "Seat not found", HttpStatus.NOT_FOUND),
    SEAT_ALREADY_BOOKED(1029, "One or more selected seats have already been booked or are pending reservation", HttpStatus.BAD_REQUEST),
    ;

    private final int code;
    private final String message;
    private final HttpStatus statusCode;

    ErrorCode(int code, String message, HttpStatus statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }
}
