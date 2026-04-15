package com.example.amc.repository;

import com.example.amc.model.Rental;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface RentalRepository extends JpaRepository<Rental, Long> {

        List<Rental> findByUserIdAndStatus(Long userId, Rental.Status status);

        List<Rental> findByStatus(Rental.Status status);

        List<Rental> findByUserId(Long userId);

    List<Rental> findAllByReturnDateBetweenAndStatus(
            LocalDate startDate, LocalDate endDate, Rental.Status status);

    @Query("SELECT COUNT(r) FROM Rental r WHERE r.car.id = :carId "
            + "AND r.status IN (com.example.amc.model.Rental$Status.DEMANDED, "
            + "com.example.amc.model.Rental$Status.APPROVED, "
            + "com.example.amc.model.Rental$Status.ACTIVE) "
            + "AND r.rentalDate < :returnDate AND r.returnDate > :rentalDate")
    long countOverlappingRentals(
            @Param("carId") Long carId,
            @Param("rentalDate") LocalDate rentalDate,
            @Param("returnDate") LocalDate returnDate
    );

    @Query("SELECT COUNT(r) FROM Rental r WHERE r.status = 'ACTIVE'")
    long countActiveRentals();

    @Query("SELECT COUNT(r) FROM Rental r WHERE r.status = 'RETURNED'")
    long countCompletedRentals();

    @Query("SELECT SUM(r.totalPrice) FROM Rental r")
    BigDecimal calculateTotalRevenue();

    @Query("SELECT AVG(r.totalPrice) FROM Rental r")
    BigDecimal calculateAverageRentalPrice();

    @Query(value = "SELECT c.brand FROM rentals r "
            + "JOIN cars c ON r.car_id = c.id "
            + "GROUP BY c.brand ORDER BY COUNT(*) DESC LIMIT 1", nativeQuery = true)
    String findMostRentedCarBrand();

        @Query("SELECT COUNT(DISTINCT r.customerEmail) FROM Rental r")
        long countUniqueCustomers();

        @Query(value = "SELECT * FROM rentals WHERE is_deleted = true ORDER BY id DESC", nativeQuery = true)
        List<Rental> findArchivedRentals();
}

