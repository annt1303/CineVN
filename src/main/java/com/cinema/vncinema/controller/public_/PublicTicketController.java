package com.cinema.vncinema.controller.public_;

import com.cinema.vncinema.dto.request.BookTicketsRequest;
import com.cinema.vncinema.dto.response.ApiResponse;
import com.cinema.vncinema.dto.response.TicketResponse;
import com.cinema.vncinema.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/tickets")
@RequiredArgsConstructor
public class PublicTicketController {

    private final TicketService ticketService;

    @PostMapping("/book")
    public ApiResponse<List<TicketResponse>> bookTickets(@RequestBody BookTicketsRequest request) {
        String email = null;
        try {
            email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        } catch (Exception e) {
            // Ignore if anonymous
        }
        
        List<TicketResponse> responses = ticketService.bookTickets(request, email);
        return ApiResponse.success("ĐẶT VÉ THÀNH CÔNG!", responses);
    }
}
