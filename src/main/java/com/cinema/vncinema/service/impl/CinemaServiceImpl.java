package com.cinema.vncinema.service.impl;

import com.cinema.vncinema.dto.request.CinemaRequest;
import com.cinema.vncinema.dto.response.CinemaResponse;
import com.cinema.vncinema.entity.Cinema;
import com.cinema.vncinema.exception.AppException;
import com.cinema.vncinema.exception.ErrorCode;
import com.cinema.vncinema.mapper.CinemaMapper;
import com.cinema.vncinema.repository.CinemaRepository;
import com.cinema.vncinema.service.CinemaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CinemaServiceImpl implements CinemaService {

    private final CinemaRepository cinemaRepository;
    private final CinemaMapper cinemaMapper;

    @Override
    @Transactional
    public CinemaResponse createCinema(CinemaRequest request) {
        if (cinemaRepository.existsByName(request.name())) {
            throw new AppException(ErrorCode.CINEMA_EXISTED);
        }
        Cinema cinema = cinemaMapper.toCinema(request);
        return cinemaMapper.toCinemaResponse(cinemaRepository.save(cinema));
    }

    @Override
    public CinemaResponse getCinemaById(Long id) {
        Cinema cinema = cinemaRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CINEMA_NOT_FOUND));
        return cinemaMapper.toCinemaResponse(cinema);
    }

    @Override
    public List<CinemaResponse> getAllCinemas() {
        return cinemaRepository.findAll().stream()
                .map(cinemaMapper::toCinemaResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CinemaResponse updateCinema(Long id, CinemaRequest request) {
        Cinema cinema = cinemaRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CINEMA_NOT_FOUND));

        if (!cinema.getName().equals(request.name()) && cinemaRepository.existsByName(request.name())) {
            throw new AppException(ErrorCode.CINEMA_EXISTED);
        }

        cinemaMapper.updateCinema(cinema, request);
        return cinemaMapper.toCinemaResponse(cinemaRepository.save(cinema));
    }

    @Override
    @Transactional
    public void deleteCinema(Long id) {
        if (!cinemaRepository.existsById(id)) {
            throw new AppException(ErrorCode.CINEMA_NOT_FOUND);
        }
        cinemaRepository.deleteById(id);
    }
}
