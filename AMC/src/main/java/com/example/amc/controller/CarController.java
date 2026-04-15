package com.example.amc.controller;

import com.example.amc.dto.car.CarRequestDto;
import com.example.amc.dto.car.CarResponseDto;
import com.example.amc.model.Car;
import com.example.amc.services.CarService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Car Management",
        description = "Endpoints for managing car rental inventory")
@RestController
@RequiredArgsConstructor
@RequestMapping(value = "/cars")
public class CarController {

    private final CarService carService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Create a new car",
            description = "Add a new car to the rental inventory with all required details")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Car successfully created",
                    content = @Content(schema = @Schema(implementation = CarResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data",
                    content = @Content)
    })
    public CarResponseDto createCar(
            @Parameter(description = "Car details to create", required = true)
            @RequestBody @Valid CarRequestDto request) {
        return carService.createCar(request);
    }

    @GetMapping
    @Operation(summary = "Get all cars",
            description = "Retrieve all available cars in the rental inventory")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved list of cars",
                    content = @Content(schema = @Schema(implementation = CarResponseDto.class)))
    })
    public List<CarResponseDto> findAllCars() {
        return carService.findAllCars();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get car by ID",
            description = "Retrieve detailed information about a specific car")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Car found",
                    content = @Content(schema = @Schema(implementation = CarResponseDto.class))),
            @ApiResponse(responseCode = "404", description = "Car not found",
                    content = @Content)
    })
    public CarResponseDto findCarById(
            @Parameter(description = "Car ID", required = true, example = "1")
            @PathVariable Long id) {
        return carService.findCarById(id);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Update car",
            description = "Update car details including inventory, pricing, and specifications")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Car successfully updated",
                    content = @Content(schema = @Schema(implementation = CarResponseDto.class))),
            @ApiResponse(responseCode = "404", description = "Car not found",
                    content = @Content),
            @ApiResponse(responseCode = "400", description = "Invalid input data",
                    content = @Content)
    })
    public CarResponseDto updateCarById(
            @Parameter(description = "Car ID", required = true, example = "1")
            @PathVariable Long id,
            @Parameter(description = "Updated car details", required = true)
            @RequestBody @Valid CarRequestDto request) {
        return carService.updateCarById(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Delete car",
            description = "Soft delete a car from the inventory (marks as deleted without removing from database)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Car successfully deleted"),
            @ApiResponse(responseCode = "404", description = "Car not found")
    })
    public ResponseEntity<String> deleteCarById(
            @Parameter(description = "Car ID", required = true, example = "1")
            @PathVariable Long id) {
        carService.deleteCarById(id);
        return ResponseEntity.ok("Car (ID: " + id + ") successfully deleted.");
    }

    @GetMapping("/search")
    @Operation(summary = "Search available cars",
            description = "Search for available cars using multiple filters. All parameters are optional.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved filtered cars",
                    content = @Content(schema = @Schema(implementation = CarResponseDto.class)))
    })
    public List<CarResponseDto> searchCars(
            @Parameter(description = "Brand name (partial match)", example = "Toyota")
            @RequestParam(required = false) String brand,
            @Parameter(description = "Fuel type", example = "ELECTRIC")
            @RequestParam(required = false) Car.FuelType fuelType,
            @Parameter(description = "Transmission type", example = "AUTOMATIC")
            @RequestParam(required = false) Car.Transmission transmission,
            @Parameter(description = "Minimum number of seats", example = "5")
            @RequestParam(required = false) Integer minSeats,
            @Parameter(description = "Maximum daily price", example = "100.00")
            @RequestParam(required = false) java.math.BigDecimal maxPrice) {
        return carService.searchCars(brand, fuelType, transmission, minSeats, maxPrice);
    }
}
