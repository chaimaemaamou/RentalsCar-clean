package com.example.amc.services;

import com.example.amc.dto.payment.PaymentRequestDto;
import com.example.amc.dto.payment.PaymentResponseDto;
import java.util.List;

public interface PaymentService {
    PaymentResponseDto createCashPayment(PaymentRequestDto request);
    PaymentResponseDto markPaymentAsPaid(Long paymentId);
    PaymentResponseDto findById(Long id);
    List<PaymentResponseDto> findByRental(Long rentalId);
}
