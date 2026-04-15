package com.example.amc.services;

import com.example.amc.dto.car.CarRequestDto;
import com.example.amc.dto.car.CarResponseDto;
import com.example.amc.model.Car;
import java.math.BigDecimal;
import java.util.List;

public interface CarService {

    CarResponseDto createCar(CarRequestDto request);

    List<CarResponseDto> findAllCars();

    CarResponseDto findCarById(Long id);

    CarResponseDto updateCarById(Long id, CarRequestDto request);

    void deleteCarById(Long id);

    List<CarResponseDto> searchCars(String brand,
                                    Car.FuelType fuelType,
                                    Car.Transmission transmission,
                                    Integer minSeats,
                                    BigDecimal maxPrice);
}
