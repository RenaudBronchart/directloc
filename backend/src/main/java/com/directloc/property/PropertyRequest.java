package com.directloc.property;

import lombok.*;

import java.math.BigDecimal;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class PropertyRequest {
    private String title;
    private String description;
    private BigDecimal pricePerNight;
    private String location;
}
