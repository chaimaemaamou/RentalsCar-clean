package com.example.amc.dto.payment;

import com.example.amc.model.Payment.DeliveryMethod;
import com.example.amc.model.Payment.Status;
import com.example.amc.model.Payment.Type;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentResponseDto(
        Long id,
        Long rentalId,
        BigDecimal amountToPay,
        BigDecimal deliveryFee,
        DeliveryMethod deliveryMethod,
        String deliveryCity,
        Status status,
        Type type,
        LocalDateTime paidAt
) {
}
