package com.example.amc.dto.payment;

import com.example.amc.model.Payment.DeliveryMethod;
import java.math.BigDecimal;

public record PaymentRequestDto(
        Long rentalId,
        DeliveryMethod deliveryMethod,
        String deliveryCity
) {
}
