package com.example.amc.mapper;

import com.example.amc.dto.car.CarRequestDto;
import com.example.amc.dto.car.CarResponseDto;
import com.example.amc.model.Car;
import com.example.amc.model.CarImage;
import java.util.ArrayList;
import java.util.List;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

@Component
@Primary
public class ManualCarMapper implements CarMapper {

    @Override
    public CarResponseDto toDto(Car car) {
        if (car == null) {
            return null;
        }

        List<String> gallery = car.getImages() == null
                ? List.of()
                : car.getImages().stream()
                        .map(CarImage::getImageUrl)
                        .toList();

        return new CarResponseDto(
                car.getId(),
                car.getModel(),
                car.getBrand(),
                car.getInventory(),
                car.getDailyFee(),
                car.getSeats(),
                car.getTransmission(),
                car.getFuelType(),
                gallery
        );
    }

    @Override
    public Car toEntity(CarRequestDto requestDto) {
        if (requestDto == null) {
            return null;
        }
        Car car = new Car();
        car.setModel(requestDto.model());
        car.setBrand(requestDto.brand());
        car.setInventory(requestDto.inventory());
        car.setDailyFee(requestDto.dailyFee());
        car.setSeats(requestDto.seats());
        car.setTransmission(requestDto.transmission());
        car.setFuelType(requestDto.fuelType());
        syncImages(car, requestDto.imageUrls());
        return car;
    }

    @Override
    public void updateFromDto(CarRequestDto dto, Car car) {
        if (dto == null || car == null) {
            return;
        }
        car.setModel(dto.model());
        car.setBrand(dto.brand());
        car.setInventory(dto.inventory());
        car.setDailyFee(dto.dailyFee());
        car.setSeats(dto.seats());
        car.setTransmission(dto.transmission());
        car.setFuelType(dto.fuelType());
        syncImages(car, dto.imageUrls());
    }

    private void syncImages(Car car, List<String> urls) {
        List<CarImage> images = new ArrayList<>();
        if (urls != null) {
            for (int i = 0; i < urls.size(); i++) {
                String url = urls.get(i);
                if (url == null || url.isBlank()) {
                    continue;
                }
                CarImage image = new CarImage();
                image.setCar(car);
                image.setImageUrl(url);
                image.setPrimaryImage(i == 0);
                images.add(image);
            }
        }
        car.setImages(images);
    }
}
