package com.cinema.vncinema.service;

import com.cinema.vncinema.dto.request.BookTicketsRequest;
import com.cinema.vncinema.dto.response.TicketResponse;
import java.util.List;

public interface TicketService {
    List<TicketResponse> bookTickets(BookTicketsRequest request, String email);
    List<TicketResponse> confirmPayment(String bookingCode);
    void cancelBooking(String bookingCode);
}
