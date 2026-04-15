package com.example.amc.services.impl;

import com.example.amc.dto.car.CarRequestDto;
import com.example.amc.dto.car.CarResponseDto;
import com.example.amc.mapper.CarMapper;
import com.example.amc.model.Car;
import com.example.amc.model.CarImage;
import com.example.amc.repository.CarRepository;
import com.example.amc.services.CarService;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CarServiceImpl implements CarService {

    private static final String CAR_NOT_FOUND_MESSAGE = "Car not found.";

    private final CarRepository carRepository;
    private final CarMapper carMapper;

    @Override
    public CarResponseDto createCar(CarRequestDto request) {
        Car car = carMapper.toEntity(request);
        syncImages(car, request.imageUrls());
        Car savedCar = carRepository.save(car);

        return carMapper.toDto(savedCar);
    }

    @Override
    public List<CarResponseDto> findAllCars() {
        return carRepository.findAll().stream()
                .map(carMapper::toDto)
                .toList();
    }

    @Override
    public CarResponseDto findCarById(Long id) {
        Car car = carRepository.findByIdNoLock(id)
                .orElseThrow(() -> new EntityNotFoundException(CAR_NOT_FOUND_MESSAGE));

        return carMapper.toDto(car);
    }

    @Override
    public CarResponseDto updateCarById(Long id, CarRequestDto request) {
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(CAR_NOT_FOUND_MESSAGE));

        carMapper.updateFromDto(request, car);
        syncImages(car, request.imageUrls());
        Car updatedCar = carRepository.save(car);

        return carMapper.toDto(updatedCar);
    }

    @Override
    public void deleteCarById(Long id) {
        carRepository.deleteById(id);
    }

    @Override
    public List<CarResponseDto> searchCars(String brand,
                                           Car.FuelType fuelType,
                                           Car.Transmission transmission,
                                           Integer minSeats,
                                           BigDecimal maxPrice) {
        return carRepository.searchAvailableCars(brand, fuelType, transmission, minSeats, maxPrice)
                .stream()
                .map(carMapper::toDto)
                .toList();
    }

    private void syncImages(Car car, List<String> imageUrls) {
        List<CarImage> newImages = new ArrayList<>();
        if (imageUrls != null) {
            for (int i = 0; i < imageUrls.size(); i++) {
                String url = imageUrls.get(i);
                if (url == null || url.isBlank()) {
                    continue;
                }
                CarImage image = new CarImage();
                image.setCar(car);
                image.setImageUrl(url);
                image.setPrimaryImage(i == 0);
                newImages.add(image);
            }
        }
        car.setImages(newImages);
    }
}
