package com.cinema.vncinema.mapper;

import com.cinema.vncinema.entity.BasePriceConfig;
import com.cinema.vncinema.dto.request.BasePriceConfigRequest;
import com.cinema.vncinema.dto.response.BasePriceConfigResponse;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", builder = @Builder(disableBuilder = true))
public interface BasePriceConfigMapper {

    BasePriceConfigResponse toBasePriceConfigResponse(BasePriceConfig basePriceConfig);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    BasePriceConfig toBasePriceConfig(BasePriceConfigRequest request);
}
