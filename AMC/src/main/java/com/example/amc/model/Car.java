package com.example.amc.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

@Entity
@Data
@SQLDelete(sql = "UPDATE cars SET is_deleted = true WHERE id = ?")
@Where(clause = "is_deleted = false")
@Table(name = "cars")
public class Car {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String model;

    @Column(nullable = false)
    private String brand;

    @Column(nullable = false)
    private int inventory;

    @Column(name = "daily_fee", nullable = false, precision = 12, scale = 2)
    private BigDecimal dailyFee;

    @Column(nullable = false)
    private int seats; // Number of seats (e.g., 2, 4, 5, 7)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Transmission transmission = Transmission.AUTOMATIC;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FuelType fuelType = FuelType.GASOLINE;

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;

    @OneToMany(mappedBy = "car", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<CarImage> images = new ArrayList<>();

    public void setImages(List<CarImage> images) {
        this.images.clear();
        if (images != null) {
            this.images.addAll(images);
        }
    }

    public List<CarImage> getImages() {
        return images;
    }

    public enum Transmission {
        MANUAL,
        AUTOMATIC
    }

    public enum FuelType {
        GASOLINE,
        DIESEL,
        ELECTRIC,
        HYBRID
    }

    @Override
    public String toString() {
        return "Car ID: " + id + '\n'
                + "Brand: " + brand + '\n'
                + "Model: " + model + '\n'
                + "Seats: " + seats + '\n'
                + "Transmission: " + transmission + '\n'
                + "Fuel: " + fuelType + '\n'
                + "Daily fee: $" + dailyFee + '\n'
                + "Inventory left: " + inventory;
    }
}
