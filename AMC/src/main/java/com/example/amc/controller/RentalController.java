package com.example.amc.controller;

import com.example.amc.dto.rental.RentalCreateRequestDto;
import com.example.amc.dto.rental.RentalPricingUpdateRequestDto;
import com.example.amc.dto.rental.RentalResponseDto;
import com.example.amc.model.Rental;
import com.example.amc.services.RentalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Rental Management",
        description = "Endpoints for managing car rentals (Manager only - customers are walk-ins)")
@RestController
@RequiredArgsConstructor
@RequestMapping(value = "/rentals")
public class RentalController {

    private final RentalService rentalService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new rental",
            description = "Create a new rental reservation. Supports both immediate rentals (today) "
                    + "and advance reservations (future dates). Automatically calculates total price based on "
                    + "rental duration and car's daily rate. Open to customers without authentication.")
    public RentalResponseDto createRental(@RequestBody @Valid RentalCreateRequestDto request) {
        return rentalService.createRental(request);
    }

    @PatchMapping("/{id}/pricing")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Update rental pricing",
            description = "Adjust the final total price for a rental before activation.")
    public RentalResponseDto updateRentalPricing(
            @PathVariable Long id,
            @RequestBody RentalPricingUpdateRequestDto requestDto) {
        return rentalService.updatePricing(id, requestDto.totalPrice());
    }

    @GetMapping
    @PreAuthorize("hasRole('MANAGER')")
        @Operation(summary = "Get rentals by criteria",
            description = "Get rentals optionally filtered by user ID, legacy active flag, or explicit status. "
                + "Manager can view all rentals in the system.")
    public List<RentalResponseDto> findRentalsByUserIdAndStatus(
            @RequestParam(name = "user_id", required = false) Long userId,
            @RequestParam(name = "is_active", required = false) Boolean isActive,
            @RequestParam(name = "status", required = false) Rental.Status status) {
        return rentalService.findRentalsByUserIdAndStatus(userId, isActive, status);
    }

    @GetMapping("/{id}")
        @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Get a rental by ID",
            description = "Get detailed information about a specific rental by its ID")
    public RentalResponseDto findRentalById(@PathVariable Long id) {
        return rentalService.findRentalById(id);
    }

    @GetMapping("/archived")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "List archived rentals",
            description = "Return rentals that were soft deleted (is_deleted = true) for audit purposes.")
    public List<RentalResponseDto> findArchivedRentals() {
        return rentalService.findArchivedRentals();
    }

    @PostMapping("/{id}/return")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Process rental return",
            description = "Mark a rental as returned, record actual return date, and increase car inventory by 1. "
                    + "Cannot return a rental that has already been returned.")
    public ResponseEntity<String> returnRental(@PathVariable Long id) {
        rentalService.returnRental(id);
        return ResponseEntity.ok("Rental (ID: " + id + ") successfully returned.");
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Approve a DELIVERY rental",
            description = "Approve a rental that requested DELIVERY. Manager must approve before activation.")
    public ResponseEntity<String> approveRental(@PathVariable Long id) {
        rentalService.approveDelivery(id);
        return ResponseEntity.ok("Rental (ID: " + id + ") approved.");
    }

    @PostMapping("/{id}/activate")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Activate a rental",
            description = "Mark a rental as ACTIVE (customer pickup or delivery complete). Decrements car inventory.")
    public ResponseEntity<String> activateRental(@PathVariable Long id) {
        rentalService.activateRental(id);
        return ResponseEntity.ok("Rental (ID: " + id + ") activated.");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Delete a rental",
            description = "Soft delete a rental record. Active rentals must be returned before deletion.")
    public ResponseEntity<Void> deleteRental(@PathVariable Long id) {
        rentalService.deleteRental(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Get rental statistics",
            description = "Get comprehensive statistics for the manager dashboard including active rentals, "
                    + "revenue, average prices, and most popular car brand.")
    public com.example.amc.dto.rental.RentalStatisticsDto getStatistics() {
        return rentalService.getStatistics();
    }
}
