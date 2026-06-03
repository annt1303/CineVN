package com.cinema.vncinema.service.impl;

import com.cinema.vncinema.dto.request.ScreenRoomRequest;
import com.cinema.vncinema.dto.request.SeatLayoutRequest;
import com.cinema.vncinema.dto.response.ScreenRoomResponse;
import com.cinema.vncinema.dto.response.SeatResponse;
import com.cinema.vncinema.entity.Cinema;
import com.cinema.vncinema.entity.ScreenRoom;
import com.cinema.vncinema.entity.Seat;
import com.cinema.vncinema.exception.AppException;
import com.cinema.vncinema.exception.ErrorCode;
import com.cinema.vncinema.mapper.ScreenRoomMapper;
import com.cinema.vncinema.mapper.SeatMapper;
import com.cinema.vncinema.repository.CinemaRepository;
import com.cinema.vncinema.repository.ScreenRoomRepository;
import com.cinema.vncinema.repository.SeatRepository;
import com.cinema.vncinema.service.ScreenRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScreenRoomServiceImpl implements ScreenRoomService {

    private final ScreenRoomRepository screenRoomRepository;
    private final CinemaRepository cinemaRepository;
    private final SeatRepository seatRepository;
    private final ScreenRoomMapper screenRoomMapper;
    private final SeatMapper seatMapper;

    @Override
    @Transactional
    public ScreenRoomResponse createScreenRoom(ScreenRoomRequest request) {
        Cinema cinema = cinemaRepository.findById(request.cinemaId())
                .orElseThrow(() -> new AppException(ErrorCode.CINEMA_NOT_FOUND));

        if (screenRoomRepository.existsByNameAndCinemaId(request.name(), request.cinemaId())) {
            throw new AppException(ErrorCode.ROOM_EXISTED);
        }

        ScreenRoom screenRoom = screenRoomMapper.toScreenRoom(request);
        screenRoom.setCinema(cinema);
        
        // Count active seats
        int totalSeats = 0;
        if (request.seats() != null) {
            totalSeats = (int) request.seats().stream().filter(SeatLayoutRequest::isActive).count();
        }
        screenRoom.setTotalSeats(totalSeats);
        
        ScreenRoom savedRoom = screenRoomRepository.save(screenRoom);

        // Generate seats
        if (request.seats() != null && !request.seats().isEmpty()) {
            List<Seat> seats = request.seats().stream()
                    .map(seatReq -> Seat.builder()
                            .screenRoom(savedRoom)
                            .rowName(seatReq.rowName())
                            .seatNumber(seatReq.seatNumber())
                            .gridColumn(seatReq.gridColumn())
                            .seatType(seatReq.seatType())
                            .isActive(seatReq.isActive())
                            .build())
                    .collect(Collectors.toList());
            seatRepository.saveAll(seats);
        }

        return getScreenRoomResponseWithSeats(savedRoom);
    }

    @Override
    public ScreenRoomResponse getScreenRoomById(Long id) {
        ScreenRoom screenRoom = screenRoomRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
        return getScreenRoomResponseWithSeats(screenRoom);
    }

    @Override
    public List<ScreenRoomResponse> getScreenRoomsByCinemaId(Long cinemaId) {
        if (!cinemaRepository.existsById(cinemaId)) {
            throw new AppException(ErrorCode.CINEMA_NOT_FOUND);
        }
        return screenRoomRepository.findByCinemaId(cinemaId).stream()
                .map(this::getScreenRoomResponseWithSeats)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ScreenRoomResponse updateScreenRoom(Long id, ScreenRoomRequest request) {
        ScreenRoom screenRoom = screenRoomRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        Cinema cinema = cinemaRepository.findById(request.cinemaId())
                .orElseThrow(() -> new AppException(ErrorCode.CINEMA_NOT_FOUND));

        if (!screenRoom.getName().equals(request.name()) 
                && screenRoomRepository.existsByNameAndCinemaId(request.name(), request.cinemaId())) {
            throw new AppException(ErrorCode.ROOM_EXISTED);
        }

        screenRoom.setName(request.name());
        screenRoom.setCinema(cinema);
        screenRoom.setRoomType(request.roomType());

        // Update seats if provided
        if (request.seats() != null) {
            seatRepository.deleteByScreenRoomId(id);
            seatRepository.flush(); // Force flush deletes to DB before inserting new ones
            List<Seat> seats = request.seats().stream()
                    .map(seatReq -> Seat.builder()
                            .screenRoom(screenRoom)
                            .rowName(seatReq.rowName())
                            .seatNumber(seatReq.seatNumber())
                            .gridColumn(seatReq.gridColumn())
                            .seatType(seatReq.seatType())
                            .isActive(seatReq.isActive())
                            .build())
                    .collect(Collectors.toList());
            seatRepository.saveAll(seats);
            
            int totalSeats = (int) request.seats().stream().filter(SeatLayoutRequest::isActive).count();
            screenRoom.setTotalSeats(totalSeats);
        }

        ScreenRoom savedRoom = screenRoomRepository.save(screenRoom);
        return getScreenRoomResponseWithSeats(savedRoom);
    }

    @Override
    @Transactional
    public void deleteScreenRoom(Long id) {
        if (!screenRoomRepository.existsById(id)) {
            throw new AppException(ErrorCode.ROOM_NOT_FOUND);
        }
        seatRepository.deleteByScreenRoomId(id);
        screenRoomRepository.deleteById(id);
    }

    private ScreenRoomResponse getScreenRoomResponseWithSeats(ScreenRoom screenRoom) {
        ScreenRoomResponse response = screenRoomMapper.toScreenRoomResponse(screenRoom);
        List<SeatResponse> seatResponses = seatRepository.findByScreenRoomId(screenRoom.getId()).stream()
                .map(seatMapper::toSeatResponse)
                .collect(Collectors.toList());
        return ScreenRoomResponse.builder()
                .id(response.id())
                .name(response.name())
                .cinemaId(response.cinemaId())
                .cinemaName(response.cinemaName())
                .roomType(response.roomType())
                .totalSeats(response.totalSeats())
                .isActive(response.isActive())
                .seats(seatResponses)
                .createdAt(response.createdAt())
                .updatedAt(response.updatedAt())
                .build();
    }
}
