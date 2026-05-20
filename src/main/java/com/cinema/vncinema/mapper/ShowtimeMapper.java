package com.cinema.vncinema.mapper;

import com.cinema.vncinema.entity.Showtime;
import com.cinema.vncinema.dto.request.ShowtimeRequest;
import com.cinema.vncinema.dto.response.ShowtimeResponse;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", builder = @Builder(disableBuilder = true))
public interface ShowtimeMapper {

    @Mapping(source = "movie.id", target = "movieId")
    @Mapping(source = "movie.title", target = "movieTitle")
    @Mapping(source = "movie.duration", target = "movieDuration")
    @Mapping(source = "movie.posterPath", target = "moviePosterPath")
    @Mapping(source = "screenRoom.id", target = "screenRoomId")
    @Mapping(source = "screenRoom.name", target = "screenRoomName")
    @Mapping(source = "screenRoom.cinema.id", target = "cinemaId")
    @Mapping(source = "screenRoom.cinema.name", target = "cinemaName")
    ShowtimeResponse toShowtimeResponse(Showtime showtime);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "movie", ignore = true)
    @Mapping(target = "screenRoom", ignore = true)
    @Mapping(target = "endTime", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Showtime toShowtime(ShowtimeRequest request);
}
