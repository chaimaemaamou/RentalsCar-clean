package com.example.amc.dto.car;

import com.example.amc.model.Car;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.util.List;

public record CarRequestDto(
        @NotBlank
        String model,

        @NotBlank
        String brand,

        @PositiveOrZero
        int inventory,

        @PositiveOrZero
        BigDecimal dailyFee,

        @Positive
        int seats,

        @NotNull
        Car.Transmission transmission,

        @NotNull
        Car.FuelType fuelType,

        @NotNull
        List<@NotBlank String> imageUrls
) {
}
