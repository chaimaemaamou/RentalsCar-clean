package com.example.amc.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Data;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

@Entity
@Data
@SQLDelete(sql = "UPDATE rentals SET is_deleted = true WHERE id = ?")
@Where(clause = "is_deleted = false")
@Table(name = "rentals")
public class Rental {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate rentalDate;

    @Column(nullable = false)
    private LocalDate returnDate;

    @Column
    private LocalDate actualReturnDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_id", nullable = false)
    private Car car;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // Customer information (for walk-in customers without user accounts)
    @Column(nullable = false)
    private String customerName;

    @Column(nullable = false)
    private String customerPhone;

    @Column
    private String customerEmail;

    @Column(nullable = false)
    private String driverLicenseNumber;

    // Pricing information
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal dailyRate;

    @Column(nullable = false)
    private Integer totalDays;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.DEMANDED; // New rentals start as DEMANDED

    // Payment handling
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod = PaymentMethod.AGENCY;

    @Column(name = "delivery_fee", nullable = false, precision = 10, scale = 2)
    private BigDecimal deliveryFee = BigDecimal.ZERO;

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false; // Default deletion status

    public enum Status {
        DEMANDED,
        APPROVED,
        ACTIVE,
        RETURNED
    }

    public enum PaymentMethod {
        AGENCY,
        DELIVERY
    }

    @Override
    public String toString() {
        return "Rental ID: " + id + '\n'
                + "Customer: " + customerName + " (" + customerPhone + ")" + '\n'
                + "License: " + driverLicenseNumber + '\n'
                + "Car ID: " + (car != null ? car.getId() : "N/A") + '\n'
                + "Rental date: " + rentalDate + '\n'
                + "Return date: " + returnDate + '\n'
                + "Total days: " + totalDays + '\n'
                + "Daily rate: $" + dailyRate + '\n'
                + "Total price: $" + totalPrice + '\n'
                + "Status: " + status;
    }
}
