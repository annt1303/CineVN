package com.cinema.vncinema.mapper;

import com.cinema.vncinema.entity.Seat;
import com.cinema.vncinema.dto.response.SeatResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SeatMapper {
    SeatResponse toSeatResponse(Seat seat);
}
