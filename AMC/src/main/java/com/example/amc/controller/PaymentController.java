package com.example.amc.controller;

import com.example.amc.dto.payment.PaymentRequestDto;
import com.example.amc.dto.payment.PaymentResponseDto;
import com.example.amc.model.Payment.DeliveryMethod;
import com.example.amc.services.PaymentService;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<PaymentResponseDto> createPayment(@RequestParam Long rentalId,
                                                            @RequestParam(defaultValue = "AGENCY") DeliveryMethod deliveryMethod,
                                                            @RequestParam(required = false) String deliveryCity) {
        PaymentRequestDto request = new PaymentRequestDto(rentalId, deliveryMethod, deliveryCity);
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.createCashPayment(request));
    }

    @PostMapping("/{paymentId}/mark-paid")
    @PreAuthorize("hasRole('MANAGER')")
    public PaymentResponseDto markPaid(@PathVariable @NotNull Long paymentId) {
        return paymentService.markPaymentAsPaid(paymentId);
    }

    @GetMapping("/{paymentId}")
    @PreAuthorize("hasRole('MANAGER')")
    public PaymentResponseDto findById(@PathVariable Long paymentId) {
        return paymentService.findById(paymentId);
    }

    @GetMapping("/by-rental/{rentalId}")
    @PreAuthorize("hasRole('MANAGER')")
    public java.util.List<PaymentResponseDto> findByRental(@PathVariable Long rentalId) {
        return paymentService.findByRental(rentalId);
    }
}
