package com.directloc.calendar;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface PropertyBlockRepository extends JpaRepository<PropertyBlock, Long> {

    // Bloques de una propiedad que se solapan con [from, to)
    List<PropertyBlock> findByProperty_IdAndEndDateAfterAndStartDateBeforeOrderByStartDateAsc(
            UUID propertyId, LocalDate from, LocalDate to
    );

    // Bloques de todas las propiedades de un owner (filtrando por email del owner)
    List<PropertyBlock> findByProperty_Owner_EmailAndEndDateAfterAndStartDateBeforeOrderByStartDateAsc(
            String ownerEmail, LocalDate from, LocalDate to
    );

    // Para validar solapes al crear
    boolean existsByProperty_IdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            UUID propertyId, LocalDate endInclusive, LocalDate startInclusive
    );
}
