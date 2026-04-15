package com.example.amc.services.impl;

import com.example.amc.dto.payment.PaymentRequestDto;
import com.example.amc.dto.payment.PaymentResponseDto;
import com.example.amc.model.Payment;
import com.example.amc.model.Rental;
import com.example.amc.repository.PaymentRepository;
import com.example.amc.repository.RentalRepository;
import com.example.amc.services.PaymentService;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private static final String RENTAL_NOT_FOUND_MESSAGE = "Rental not found.";
    private static final String PAYMENT_NOT_FOUND_MESSAGE = "Payment not found.";

    private final PaymentRepository paymentRepository;
    private final RentalRepository rentalRepository;

    @Override
    @Transactional
    public PaymentResponseDto createCashPayment(PaymentRequestDto request) {
        Rental rental = rentalRepository.findById(request.rentalId())
                .orElseThrow(() -> new EntityNotFoundException(RENTAL_NOT_FOUND_MESSAGE));

        // Prevent duplicate PAYMENT for rental
        paymentRepository.findByRentalIdAndType(rental.getId(), Payment.Type.PAYMENT)
                .ifPresent(p -> { throw new IllegalStateException("Payment already exists for this rental."); });

        Payment payment = new Payment();
        payment.setRental(rental);
        payment.setStatus(Payment.Status.PENDING);
        payment.setType(Payment.Type.PAYMENT);
        payment.setDeliveryMethod(request.deliveryMethod());
        payment.setDeliveryCity(request.deliveryCity());

        BigDecimal deliveryFee = calculateDeliveryFee(request.deliveryMethod(), request.deliveryCity());
        payment.setDeliveryFee(deliveryFee);

        BigDecimal amountToPay = rental.getTotalPrice();
        if (deliveryFee != null) {
            amountToPay = amountToPay.add(deliveryFee);
        }
        payment.setAmountToPay(amountToPay);

        Payment saved = paymentRepository.save(payment);
        return toDto(saved);
    }

    @Override
    @Transactional
    public PaymentResponseDto markPaymentAsPaid(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new EntityNotFoundException(PAYMENT_NOT_FOUND_MESSAGE));
        if (payment.getStatus() == Payment.Status.PAID) {
            throw new IllegalStateException("Payment is already marked as PAID.");
        }
        payment.setStatus(Payment.Status.PAID);
        payment.setPaidAt(LocalDateTime.now());
        Payment updated = paymentRepository.save(payment);
        return toDto(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponseDto findById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(PAYMENT_NOT_FOUND_MESSAGE));
        return toDto(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponseDto> findByRental(Long rentalId) {
        return paymentRepository.findAll().stream()
                .filter(p -> p.getRental() != null && p.getRental().getId().equals(rentalId))
                .map(this::toDto)
                .toList();
    }

    private BigDecimal calculateDeliveryFee(Payment.DeliveryMethod method, String city) {
        if (method == Payment.DeliveryMethod.DELIVERY && city != null && city.equalsIgnoreCase("Agadir")) {
            return BigDecimal.valueOf(30); // 30 dhs fixed fee for Agadir delivery
        }
        return null; // No fee for agency or other cities (extend later if needed)
    }

    private PaymentResponseDto toDto(Payment p) {
        return new PaymentResponseDto(
                p.getId(),
                p.getRental() != null ? p.getRental().getId() : null,
                p.getAmountToPay(),
                p.getDeliveryFee(),
                p.getDeliveryMethod(),
                p.getDeliveryCity(),
                p.getStatus(),
                p.getType(),
                p.getPaidAt()
        );
    }
}
