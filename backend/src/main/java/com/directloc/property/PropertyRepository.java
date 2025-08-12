package com.directloc.property;

import com.directloc.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PropertyRepository extends JpaRepository<Property, UUID> {
    List<Property> findByOwner(User owner);

    Page<Property> findAll(Pageable pageable);

    Page<Property> findByLocationIgnoreCaseContaining(String q, Pageable pageable);

    Page<Property> findByLocationIgnoreCaseContainingAndMaxGuestsGreaterThanEqual(
            String q, Integer guests, Pageable pageable);
}
