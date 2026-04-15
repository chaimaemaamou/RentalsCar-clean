package com.example.amc.dto.rental;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;
import com.example.amc.model.Rental;

public record RentalCreateRequestDto(
        @Positive(message = "Car ID must be positive")
        Long carId,

        @NotNull(message = "Rental date is required")
        @FutureOrPresent(message = "Rental date cannot be in the past")
        LocalDate rentalDate,

        @NotNull(message = "Return date is required")
        @FutureOrPresent(message = "Return date cannot be in the past")
        LocalDate returnDate,

        @NotBlank(message = "Customer name is required")
        String customerName,

        @NotBlank(message = "Customer phone is required")
        String customerPhone,

        @Email(message = "Invalid email format")
        String customerEmail,

        @NotBlank(message = "Driver license number is required")
        String driverLicenseNumber,

        @NotNull(message = "Payment method is required")
        Rental.PaymentMethod paymentMethod
) {
}
