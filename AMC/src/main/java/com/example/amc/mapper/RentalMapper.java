package com.example.amc.mapper;

import com.example.amc.dto.rental.RentalResponseDto;
import com.example.amc.model.Rental;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RentalMapper {

    @Mapping(target = "carId", source = "car.id")
    @Mapping(target = "carBrand", source = "car.brand")
    @Mapping(target = "carModel", source = "car.model")
    @Mapping(target = "status", expression = "java(rental.getStatus().name())")
    @Mapping(target = "paymentMethod", expression = "java(rental.getPaymentMethod().name())")
    @Mapping(target = "deliveryFee", source = "deliveryFee")
    RentalResponseDto toDto(Rental rental);
}
