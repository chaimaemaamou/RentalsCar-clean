package com.example.amc.dto.rental;

import java.math.BigDecimal;

public record RentalStatisticsDto(
        long totalActiveRentals,
        long totalCompletedRentals,
        BigDecimal totalRevenue,
        BigDecimal averageRentalPrice,
        String mostRentedCarBrand,
        int totalCustomers
) {
}
