package com.directloc.property;

import lombok.*;

import java.math.BigDecimal;

/**
 * DTO used to create or update a property.
 * All fields are required on the client side.
 */
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class PropertyRequest {
    private String title;             // Property title
    private String description;       // Short description of the property
    private BigDecimal pricePerNight; // Nightly rental price
    private String location;          // Property location (e.g. city or address)
}
