package com.example.amc.mapper;

import com.example.amc.config.MapperConfig;
import com.example.amc.dto.car.CarRequestDto;
import com.example.amc.dto.car.CarResponseDto;
import com.example.amc.model.Car;
import com.example.amc.model.CarImage;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(config = MapperConfig.class)
public interface CarMapper {

    @Mapping(target = "imageGallery", expression = "java(mapToImageUrls(car.getImages()))")
    CarResponseDto toDto(Car car);

    @Mapping(target = "images", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    Car toEntity(CarRequestDto requestDto);

    @Mapping(target = "images", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    void updateFromDto(CarRequestDto dto, @MappingTarget Car car);

    default List<String> mapToImageUrls(List<CarImage> images) {
        if (images == null) {
            return List.of();
        }
        return images.stream()
                .map(CarImage::getImageUrl)
                .toList();
    }
}
