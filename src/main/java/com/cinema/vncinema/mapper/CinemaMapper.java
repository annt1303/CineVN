package com.cinema.vncinema.mapper;

import com.cinema.vncinema.entity.Cinema;
import com.cinema.vncinema.dto.request.CinemaRequest;
import com.cinema.vncinema.dto.response.CinemaResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Builder;

@Mapper(componentModel = "spring", builder = @Builder(disableBuilder = true))
public interface CinemaMapper {

    CinemaResponse toCinemaResponse(Cinema cinema);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Cinema toCinema(CinemaRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateCinema(@MappingTarget Cinema cinema, CinemaRequest request);
}
