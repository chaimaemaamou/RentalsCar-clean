package com.example.amc.services.impl;

import com.example.amc.dto.rental.RentalCreateRequestDto;
import com.example.amc.dto.rental.RentalResponseDto;
import com.example.amc.dto.rental.RentalStatisticsDto;
import com.example.amc.exception.custom.NoInventoryAvailableException;
import com.example.amc.exception.custom.RentalAlreadyReturnedException;
import com.example.amc.mapper.RentalMapper;
import com.example.amc.model.Car;
import com.example.amc.model.Rental;
import com.example.amc.repository.CarRepository;
import com.example.amc.repository.RentalRepository;
import com.example.amc.services.RentalService;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RentalServiceImpl implements RentalService {

    private static final String RENTAL_NOT_FOUND_MESSAGE = "Rental not found.";
    private static final String CAR_NOT_FOUND_MESSAGE = "Car not found.";

    private final RentalRepository rentalRepository;
    private final CarRepository carRepository;
    private final RentalMapper rentalMapper;

    @Override
    @Transactional
    public RentalResponseDto createRental(RentalCreateRequestDto request) {
        // Get dates from request
        LocalDate rentalDate = request.rentalDate();
        LocalDate returnDate = request.returnDate();
        
        // Validate date logic
        if (returnDate.isBefore(rentalDate) || returnDate.isEqual(rentalDate)) {
            throw new IllegalArgumentException(
                "Return date must be at least one day after rental date.");
        }
        
        // Fetch car first to check inventory
        Car car = carRepository.findById(request.carId())
            .orElseThrow(() -> new EntityNotFoundException(CAR_NOT_FOUND_MESSAGE));
        
        // Check for overlapping bookings against available inventory
        // Count how many units are already booked for overlapping dates
        long overlappingBookings = rentalRepository.countOverlappingRentals(
                request.carId(), rentalDate, returnDate);
        
        // If all inventory units are already booked for these dates, reject
        if (overlappingBookings >= car.getInventory()) {
            throw new IllegalStateException(
                "Car is already booked for the selected dates. Please choose different dates.");
        }
        
        // Calculate rental duration
        long totalDays = java.time.temporal.ChronoUnit.DAYS.between(rentalDate, returnDate);

        // Base rental price (daily rate × total days)
        BigDecimal dailyRate = car.getDailyFee();
        BigDecimal basePrice = dailyRate.multiply(BigDecimal.valueOf(totalDays));

        // Delivery fee logic (fixed 30 dh for DELIVERY, otherwise 0)
        BigDecimal deliveryFee = request.paymentMethod() == Rental.PaymentMethod.DELIVERY
            ? new BigDecimal("30.00")
            : BigDecimal.ZERO;

        BigDecimal totalPrice = basePrice.add(deliveryFee);

        // Create rental with customer information and pricing (starts as DEMANDED)
        Rental rental = new Rental();
        rental.setCar(car);
        rental.setUser(null); // No user authentication - manager handles all rentals
        rental.setRentalDate(rentalDate);
        rental.setReturnDate(returnDate);
        rental.setStatus(Rental.Status.DEMANDED);
        
        // Customer information
        rental.setCustomerName(request.customerName());
        rental.setCustomerPhone(request.customerPhone());
        rental.setCustomerEmail(request.customerEmail());
        rental.setDriverLicenseNumber(request.driverLicenseNumber());
        
        // Pricing information
        rental.setDailyRate(dailyRate);
        rental.setTotalDays((int) totalDays);
        rental.setPaymentMethod(request.paymentMethod());
        rental.setDeliveryFee(deliveryFee);
        rental.setTotalPrice(totalPrice);
        
        Rental savedRental = rentalRepository.save(rental);
        // Cash payment only; totalPrice already includes optional delivery fee
        return rentalMapper.toDto(savedRental);
    }

    @Override
    @Transactional
    public void approveDelivery(Long id) {
        Rental rental = rentalRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(RENTAL_NOT_FOUND_MESSAGE));

        if (rental.getPaymentMethod() != Rental.PaymentMethod.DELIVERY) {
            throw new IllegalStateException("Only DELIVERY rentals can be approved.");
        }

        if (rental.getStatus() != Rental.Status.DEMANDED) {
            throw new IllegalStateException("Can only approve a DEMANDED rental.");
        }

        rental.setStatus(Rental.Status.APPROVED);
        rentalRepository.save(rental);
    }

    @Override
    @Transactional
    public void activateRental(Long id) {
        Rental rental = rentalRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(RENTAL_NOT_FOUND_MESSAGE));

        // For AGENCY: DEMANDED -> ACTIVE
        // For DELIVERY: APPROVED -> ACTIVE
        if (rental.getPaymentMethod() == Rental.PaymentMethod.AGENCY) {
            if (rental.getStatus() != Rental.Status.DEMANDED) {
                throw new IllegalStateException("AGENCY rentals must be DEMANDED before activation.");
            }
        } else { // DELIVERY
            if (rental.getStatus() != Rental.Status.APPROVED) {
                throw new IllegalStateException("DELIVERY rentals must be APPROVED before activation.");
            }
        }

        // Reserve/decrement inventory now (policy B)
        Car car = carRepository.findByIdForUpdate(rental.getCar().getId())
                .orElseThrow(() -> new EntityNotFoundException(CAR_NOT_FOUND_MESSAGE));

        if (car.getInventory() <= 0) {
            throw new NoInventoryAvailableException(
                "No inventory available for car: " + car.getBrand() + " " + car.getModel());
        }

        car.setInventory(car.getInventory() - 1);
        carRepository.save(car);

        rental.setStatus(Rental.Status.ACTIVE);
        rentalRepository.save(rental);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RentalResponseDto> findRentalsByUserIdAndStatus(Long userId, Boolean isActive, Rental.Status statusFilter) {
        List<Rental> rentals;

        if (statusFilter != null) {
            rentals = userId != null
                    ? rentalRepository.findByUserIdAndStatus(userId, statusFilter)
                    : rentalRepository.findByStatus(statusFilter);
        } else if (isActive != null) {
            Rental.Status mappedStatus = Boolean.TRUE.equals(isActive)
                    ? Rental.Status.ACTIVE
                    : Rental.Status.RETURNED;
            rentals = userId != null
                    ? rentalRepository.findByUserIdAndStatus(userId, mappedStatus)
                    : rentalRepository.findByStatus(mappedStatus);
        } else {
            rentals = userId != null
                    ? rentalRepository.findByUserId(userId)
                    : rentalRepository.findAll();
        }

        return rentals.stream()
                .map(rentalMapper::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public RentalResponseDto findRentalById(Long id) {
        Rental rental = rentalRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(RENTAL_NOT_FOUND_MESSAGE));

        // Manager can view any rental - no authorization check needed
        return rentalMapper.toDto(rental);
    }

    @Override
    @Transactional
    public void returnRental(Long id) {
        Rental rental = rentalRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(RENTAL_NOT_FOUND_MESSAGE));

        // Manager processes all returns - ensure rental is ACTIVE
        if (rental.getStatus() == Rental.Status.RETURNED) {
            throw new RentalAlreadyReturnedException("Rental has already been returned.");
        }

        if (rental.getStatus() != Rental.Status.ACTIVE) {
            throw new IllegalStateException("Only ACTIVE rentals can be returned.");
        }
        LocalDate actualReturnDate = LocalDate.now();
        rental.setActualReturnDate(actualReturnDate);
        
       
        
        rental.setStatus(Rental.Status.RETURNED);
        rentalRepository.save(rental);

        // Return car to inventory
        Car car = carRepository.findByIdForUpdate(rental.getCar().getId())
                .orElseThrow(() -> new EntityNotFoundException(CAR_NOT_FOUND_MESSAGE));

        car.setInventory(car.getInventory() + 1);
        carRepository.save(car);
    }

    @Override
    @Transactional
    public void deleteRental(Long id) {
        Rental rental = rentalRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(RENTAL_NOT_FOUND_MESSAGE));

        if (rental.getStatus() == Rental.Status.ACTIVE) {
            throw new IllegalStateException("Cannot delete an active rental. Mark it as returned first.");
        }

        rentalRepository.delete(rental);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RentalResponseDto> findArchivedRentals() {
        return rentalRepository.findArchivedRentals()
                .stream()
                .map(rentalMapper::toDto)
                .toList();
    }

    
    @Override
    @Transactional(readOnly = true)
    public RentalStatisticsDto getStatistics() {
        long activeRentals = rentalRepository.countActiveRentals();
        long completedRentals = rentalRepository.countCompletedRentals();

        BigDecimal totalRevenue = rentalRepository.calculateTotalRevenue();
        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }

        BigDecimal averagePrice = rentalRepository.calculateAverageRentalPrice();
        if (averagePrice == null) {
            averagePrice = BigDecimal.ZERO;
        }

        String mostRentedBrand = rentalRepository.findMostRentedCarBrand();
        if (mostRentedBrand == null || mostRentedBrand.isBlank()) {
            mostRentedBrand = "N/A";
        }

        long uniqueCustomers = rentalRepository.countUniqueCustomers();

        return new RentalStatisticsDto(
                activeRentals,
                completedRentals,
                totalRevenue,
                averagePrice,
                mostRentedBrand,
                (int) uniqueCustomers
        );
    }

    @Override
    @Transactional
    public RentalResponseDto updatePricing(Long id, BigDecimal totalPrice) {
        if (totalPrice == null || totalPrice.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Total price must be greater than zero.");
        }

        Rental rental = rentalRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(RENTAL_NOT_FOUND_MESSAGE));

        rental.setTotalPrice(totalPrice);
        Rental saved = rentalRepository.save(rental);
        return rentalMapper.toDto(saved);
    }
}
