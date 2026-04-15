package com.example.amc.services;

import com.example.amc.dto.rental.RentalCreateRequestDto;
import com.example.amc.dto.rental.RentalResponseDto;
import com.example.amc.dto.rental.RentalStatisticsDto;
import com.example.amc.model.Rental;
import java.util.List;

public interface RentalService {

    RentalResponseDto createRental(RentalCreateRequestDto request);

    List<RentalResponseDto> findRentalsByUserIdAndStatus(Long userId, Boolean isActive, Rental.Status status);

    RentalResponseDto findRentalById(Long id);

    void approveDelivery(Long id);

    void activateRental(Long id);

    void returnRental(Long id);

    void deleteRental(Long id);

    RentalStatisticsDto getStatistics();

    List<RentalResponseDto> findArchivedRentals();

    RentalResponseDto updatePricing(Long id, java.math.BigDecimal totalPrice);
}
