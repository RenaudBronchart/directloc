package com.directloc.property;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

/**
 * DTO used to create/update properties from the API.
 *
 * Validation notes:
 * - We mirror constraints from the JPA entity to fail fast on the API layer
 *   instead of at the DB (e.g. description length).
 * - Price can be zero with @DecimalMin("0.0"). If you want strictly > 0,
 *   switch to @DecimalMin(value = "0.0", inclusive = false).
 * - Integer fields are nullable so they remain optional in updates. When provided,
 *   their minimums are enforced.
 */
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class PropertyRequest {

    /** Human-friendly title. DB default length is usually 255; we enforce it here. */
    @NotBlank
    @Size(max = 255, message = "Title must be at most 255 characters.")
    private String title;

    /** Long description. Entity column is length=2000 → enforce same limit here. */
    @NotBlank
    @Size(max = 2000, message = "Description must be at most 2000 characters.")
    private String description;

    /** City/area/country string; cap length for safety. */
    @NotBlank
    @Size(max = 255, message = "Location must be at most 255 characters.")
    private String location;

    /**
     * Nightly price. Accepts zero; change inclusive=false to require > 0.
     * Consider normalizing scale (2 decimals) in the service layer.
     */
    @NotNull
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be > 0.")
    private BigDecimal pricePerNight;

    /** Optional numeric attributes with lower bounds. */
    @Min(value = 0, message = "Bedrooms cannot be negative.")
    private Integer bedrooms;

    @Min(value = 0, message = "Bathrooms cannot be negative.")
    private Integer bathrooms;

    @Min(value = 1, message = "Max guests must be at least 1.")
    private Integer maxGuests;

    /**
     * Optional cover URL. If null/blank, the entity @PrePersist/@PreUpdate
     * will auto-generate a Picsum URL based on the title.
     * If you want to validate URL format, you could add a @Pattern here.
     */
    private String coverUrl;
}
