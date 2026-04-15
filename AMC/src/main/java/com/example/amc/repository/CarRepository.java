package com.example.amc.repository;

import com.example.amc.model.Car;
import jakarta.persistence.LockModeType;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CarRepository extends JpaRepository<Car, Long> {

        @Lock(LockModeType.PESSIMISTIC_WRITE)
        @Query("select c from Car c where c.id = :id")
        Optional<Car> findByIdForUpdate(@Param("id") Long id);

        @Lock(LockModeType.NONE)
        @Query("select c from Car c where c.id = :id")
        Optional<Car> findByIdNoLock(@Param("id") Long id);

    @Query("SELECT c FROM Car c WHERE " +
            "(:brand IS NULL OR c.brand = :brand) AND " +
            "(:fuelType IS NULL OR c.fuelType = :fuelType) AND " +
            "(:transmission IS NULL OR c.transmission = :transmission) AND " +
            "(:minSeats IS NULL OR c.seats >= :minSeats) AND " +
            "(:maxPrice IS NULL OR c.dailyFee <= :maxPrice)")
    List<Car> searchAvailableCars(@Param("brand") String brand,
                                  @Param("fuelType") Car.FuelType fuelType,
                                  @Param("transmission") Car.Transmission transmission,
                                  @Param("minSeats") Integer minSeats,
                                  @Param("maxPrice") BigDecimal maxPrice);
}
