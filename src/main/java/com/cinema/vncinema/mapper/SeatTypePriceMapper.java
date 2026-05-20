package com.cinema.vncinema.mapper;

import com.cinema.vncinema.entity.SeatTypePrice;
import com.cinema.vncinema.dto.request.SeatTypePriceRequest;
import com.cinema.vncinema.dto.response.SeatTypePriceResponse;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", builder = @Builder(disableBuilder = true))
public interface SeatTypePriceMapper {

    SeatTypePriceResponse toSeatTypePriceResponse(SeatTypePrice seatTypePrice);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    SeatTypePrice toSeatTypePrice(SeatTypePriceRequest request);
}
