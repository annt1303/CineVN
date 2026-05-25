package com.cinema.vncinema.service.impl;

import com.cinema.vncinema.dto.request.ShowtimeRequest;
import com.cinema.vncinema.dto.response.ShowtimeResponse;
import com.cinema.vncinema.dto.response.ShowtimeSeatPriceResponse;
import com.cinema.vncinema.dto.response.ShowtimeSeatsResponse;
import com.cinema.vncinema.entity.*;
import com.cinema.vncinema.exception.AppException;
import com.cinema.vncinema.exception.ErrorCode;
import com.cinema.vncinema.mapper.ShowtimeMapper;
import com.cinema.vncinema.repository.*;
import com.cinema.vncinema.service.PricingService;
import com.cinema.vncinema.service.ShowtimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.redis.core.StringRedisTemplate;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShowtimeServiceImpl implements ShowtimeService {

    private final ShowtimeRepository showtimeRepository;
    private final MovieRepository movieRepository;
    private final ScreenRoomRepository screenRoomRepository;
    private final SeatRepository seatRepository;
    private final TicketRepository ticketRepository;
    private final SeatTypePriceRepository seatTypePriceRepository;
    private final PricingService pricingService;
    private final ShowtimeMapper showtimeMapper;
    private final StringRedisTemplate redisTemplate;

    @Override
    @Transactional
    public ShowtimeResponse createShowtime(ShowtimeRequest request) {
        Movie movie = movieRepository.findById(request.movieId())
                .orElseThrow(() -> new AppException(ErrorCode.MOVIE_NOT_FOUND));

        ScreenRoom screenRoom = screenRoomRepository.findById(request.screenRoomId())
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        LocalDateTime endTime = request.startTime().plusMinutes(movie.getDuration());

        // Check for overlaps with 20 minutes buffer before and after
        checkShowtimeOverlap(screenRoom.getId(), request.startTime(), endTime, null);

        BigDecimal basePrice = request.basePrice();
        if (basePrice == null) {
            basePrice = pricingService.calculateBasePrice(screenRoom.getRoomType(), request.movieFormat(), request.startTime());
        }

        Showtime showtime = showtimeMapper.toShowtime(request);
        showtime.setMovie(movie);
        showtime.setScreenRoom(screenRoom);
        showtime.setEndTime(endTime);
        showtime.setBasePrice(basePrice);
        if (request.isActive() != null) {
            showtime.setIsActive(request.isActive());
        }

        Showtime saved = showtimeRepository.save(showtime);
        return showtimeMapper.toShowtimeResponse(saved);
    }

    @Override
    public ShowtimeResponse getShowtimeById(Long id) {
        Showtime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SHOWTIME_NOT_FOUND));
        return showtimeMapper.toShowtimeResponse(showtime);
    }

    @Override
    public List<ShowtimeResponse> getAllShowtimes() {
        return showtimeRepository.findAll().stream()
                .map(showtimeMapper::toShowtimeResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ShowtimeResponse updateShowtime(Long id, ShowtimeRequest request) {
        Showtime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SHOWTIME_NOT_FOUND));

        Movie movie = movieRepository.findById(request.movieId())
                .orElseThrow(() -> new AppException(ErrorCode.MOVIE_NOT_FOUND));

        ScreenRoom screenRoom = screenRoomRepository.findById(request.screenRoomId())
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        LocalDateTime endTime = request.startTime().plusMinutes(movie.getDuration());

        // Check for overlaps excluding current showtime
        checkShowtimeOverlap(screenRoom.getId(), request.startTime(), endTime, id);

        BigDecimal basePrice = request.basePrice();
        if (basePrice == null) {
            basePrice = pricingService.calculateBasePrice(screenRoom.getRoomType(), request.movieFormat(), request.startTime());
        }

        showtime.setMovie(movie);
        showtime.setScreenRoom(screenRoom);
        showtime.setStartTime(request.startTime());
        showtime.setEndTime(endTime);
        showtime.setMovieFormat(request.movieFormat());
        showtime.setBasePrice(basePrice);
        if (request.isActive() != null) {
            showtime.setIsActive(request.isActive());
        }

        Showtime saved = showtimeRepository.save(showtime);
        return showtimeMapper.toShowtimeResponse(saved);
    }

    @Override
    @Transactional
    public void deleteShowtime(Long id) {
        if (!showtimeRepository.existsById(id)) {
            throw new AppException(ErrorCode.SHOWTIME_NOT_FOUND);
        }
        showtimeRepository.deleteById(id);
    }

    @Override
    public List<ShowtimeResponse> getShowtimesByMovieAndDate(Long movieId, LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);
        return showtimeRepository.findByMovieIdAndStartTimeBetweenAndIsActiveTrue(movieId, startOfDay, endOfDay).stream()
                .map(showtimeMapper::toShowtimeResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ShowtimeResponse> getShowtimesByDate(LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);
        return showtimeRepository.findByStartTimeBetween(startOfDay, endOfDay).stream()
                .map(showtimeMapper::toShowtimeResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ShowtimeSeatsResponse getShowtimeSeats(Long showtimeId, String bookingToken) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new AppException(ErrorCode.SHOWTIME_NOT_FOUND));

        List<Seat> seats = seatRepository.findByScreenRoomId(showtime.getScreenRoom().getId());
        List<Ticket> tickets = ticketRepository.findByShowtimeId(showtimeId);
        List<SeatTypePrice> seatTypePrices = seatTypePriceRepository.findAll();

        Map<SeatType, BigDecimal> surcharges = seatTypePrices.stream()
                .collect(Collectors.toMap(SeatTypePrice::getSeatType, SeatTypePrice::getSurcharge));

        Set<Long> bookedSeatIds = tickets.stream()
                .filter(t -> "BOOKED".equalsIgnoreCase(t.getStatus()) || "PENDING".equalsIgnoreCase(t.getStatus()))
                .map(t -> t.getSeat().getId())
                .collect(Collectors.toSet());

        List<ShowtimeSeatPriceResponse> seatResponses = seats.stream()
                .map(seat -> {
                    BigDecimal surcharge = surcharges.getOrDefault(seat.getSeatType(), BigDecimal.ZERO);
                    BigDecimal price = showtime.getBasePrice().add(surcharge);
                    
                    String status;
                    if (bookedSeatIds.contains(seat.getId())) {
                        status = "booked";
                    } else {
                        String key = "seat:hold:" + showtimeId + ":" + seat.getId();
                        String heldToken = redisTemplate.opsForValue().get(key);
                        if (heldToken != null) {
                            if (bookingToken != null && bookingToken.equals(heldToken)) {
                                status = "available"; // Held by current user, so available to them
                            } else {
                                status = "held"; // Held by someone else, show as grayed out
                            }
                        } else {
                            status = "available";
                        }
                    }

                    return ShowtimeSeatPriceResponse.builder()
                            .id(seat.getId())
                            .rowName(seat.getRowName())
                            .seatNumber(seat.getSeatNumber())
                            .gridColumn(seat.getGridColumn())
                            .seatType(seat.getSeatType())
                            .price(price)
                            .status(status)
                            .build();
                })
                .collect(Collectors.toList());

        return ShowtimeSeatsResponse.builder()
                .showtimeId(showtime.getId())
                .basePrice(showtime.getBasePrice())
                .screenRoomName(showtime.getScreenRoom().getName())
                .movieTitle(showtime.getMovie().getTitle())
                .seats(seatResponses)
                .build();
    }

    private void checkShowtimeOverlap(Long screenRoomId, LocalDateTime startTime, LocalDateTime endTime, Long excludeId) {
        // Gap of at least 20 minutes is required.
        // Therefore, we check overlap on interval: [startTime - 20m, endTime + 20m]
        LocalDateTime checkStartTime = startTime.minusMinutes(20);
        LocalDateTime checkEndTime = endTime.plusMinutes(20);

        List<Showtime> overlaps = showtimeRepository.findOverlappingShowtimes(
                screenRoomId,
                checkStartTime,
                checkEndTime,
                excludeId
        );

        if (!overlaps.isEmpty()) {
            throw new AppException(ErrorCode.SHOWTIME_OVERLAP);
        }
    }
}
