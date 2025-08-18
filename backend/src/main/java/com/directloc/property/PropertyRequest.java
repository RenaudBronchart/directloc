package com.directloc.property;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class PropertyRequest {
    @NotBlank private String title;
    @NotBlank private String description;
    @NotBlank private String location;
    @NotNull @DecimalMin("0.0") private BigDecimal pricePerNight;

    // optionnels
    @Min(0) private Integer bedrooms;
    @Min(0) private Integer bathrooms;
    @Min(1) private Integer maxGuests;
    private String coverUrl;
}

