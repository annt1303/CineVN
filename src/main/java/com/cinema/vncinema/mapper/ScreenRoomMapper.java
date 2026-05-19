package com.cinema.vncinema.mapper;

import com.cinema.vncinema.entity.ScreenRoom;
import com.cinema.vncinema.dto.request.ScreenRoomRequest;
import com.cinema.vncinema.dto.response.ScreenRoomResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Builder;

@Mapper(componentModel = "spring", uses = {SeatMapper.class}, builder = @Builder(disableBuilder = true))
public interface ScreenRoomMapper {

    @Mapping(target = "cinemaId", source = "cinema.id")
    @Mapping(target = "cinemaName", source = "cinema.name")
    @Mapping(target = "seats", ignore = true)
    ScreenRoomResponse toScreenRoomResponse(ScreenRoom screenRoom);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "cinema", ignore = true)
    @Mapping(target = "totalSeats", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    ScreenRoom toScreenRoom(ScreenRoomRequest request);
}
