package com.example.amc.dto.rental;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RentalResponseDto(
        Long id,
        Long carId,
        String carBrand,
        String carModel,
        LocalDate rentalDate,
        LocalDate returnDate,
        LocalDate actualReturnDate,
        String customerName,
        String customerPhone,
        String customerEmail,
        String driverLicenseNumber,
        BigDecimal dailyRate,
        Integer totalDays,
        BigDecimal totalPrice,
        String status,
        String paymentMethod,
        BigDecimal deliveryFee
) {
}
