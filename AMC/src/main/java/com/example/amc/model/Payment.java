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
import java.time.LocalDateTime;
import java.math.BigDecimal;
import lombok.Data;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

@Entity
@Data
@SQLDelete(sql = "UPDATE payments SET is_deleted = true WHERE id = ?")
@Where(clause = "is_deleted = false")
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rental_id", nullable = false)
    private Rental rental;

    @Column(nullable = false)
    private String sessionUrl;

    @Column(nullable = false)
    private String sessionId;

    @Column(name = "amount_to_pay", nullable = false, precision = 12, scale = 2)
    private BigDecimal amountToPay;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.PENDING; // default cash payment status

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Type type = Type.PAYMENT; // default type

    // Delivery details (optional for agency cash payment)
    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_method")
    private DeliveryMethod deliveryMethod = DeliveryMethod.AGENCY; // default

    @Column(name = "delivery_city")
    private String deliveryCity; // e.g., "Agadir" triggers fixed fee

    @Column(name = "delivery_fee", precision = 12, scale = 2)
    private BigDecimal deliveryFee; // null or 30.00 for Agadir

    @Column(name = "paid_at")
    private LocalDateTime paidAt; // timestamp when marked PAID

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false; // Default deletion status

    public enum Status {
        PENDING,
        PAID
    }

    public enum Type {
        PAYMENT,
        FINE
    }

    public enum DeliveryMethod {
        AGENCY,
        DELIVERY
    }
}
