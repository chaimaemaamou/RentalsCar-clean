package com.example.amc.dto.car;

import com.example.amc.model.Car;
import java.math.BigDecimal;
import java.util.List;

public record CarResponseDto(
        Long id,
        String model,
        String brand,
        int inventory,
        BigDecimal dailyFee,
        int seats,
        Car.Transmission transmission,
        Car.FuelType fuelType,
        List<String> imageGallery
) {
}
