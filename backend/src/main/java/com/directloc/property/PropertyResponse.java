package com.directloc.property;

import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class PropertyResponse {
    private UUID id;
    private String title;
    private String description;     // 👈 ajouté
    private String location;
    private BigDecimal pricePerNight;
    private String coverUrl;
    private Integer bedrooms;
    private Integer bathrooms;
    private Integer maxGuests;
    private Instant createdAt;
    private Instant updatedAt;      // 👈 ajouté (optionnel mais utile)
    private String ownerEmail;      // 👈 ajouté (optionnel, pratique pour le front)
}
