package com.directloc.property;

import com.directloc.user.User;
import com.directloc.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final UserService userService;

    // Creates a new property and assigns it to the current user
    public Property create(PropertyRequest request) {
        User owner = userService.getCurrentUser();

        Property property = Property.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .location(request.getLocation())
                .pricePerNight(request.getPricePerNight())
                .owner(owner)
                .build();

        return propertyRepository.save(property);
    }

    // Returns all properties in the system
    public List<Property> findAll() {
        return propertyRepository.findAll();
    }

    // Finds a property by its ID
    public Optional<Property> findById(UUID id) {
        return propertyRepository.findById(id);
    }

    // Finds all properties owned by the currently authenticated user
    public List<Property> findMyProperties() {
        User owner = userService.getCurrentUser();
        return propertyRepository.findByOwner(owner);
    }

    // Updates an existing property (must belong to the current user)
    public Property update(UUID id, PropertyRequest request) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Property not found"));

        User currentUser = userService.getCurrentUser();
        if (!property.getOwner().getId().equals(currentUser.getId())) {
            throw new SecurityException("You are not allowed to update this property");
        }

        property.setTitle(request.getTitle());
        property.setDescription(request.getDescription());
        property.setLocation(request.getLocation());
        property.setPricePerNight(request.getPricePerNight());

        return propertyRepository.save(property);
    }

    // Deletes a property by ID (only if owned by current user)
    public void delete(UUID id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Property not found"));

        User currentUser = userService.getCurrentUser();
        if (!property.getOwner().getId().equals(currentUser.getId())) {
            throw new SecurityException("You are not allowed to delete this property");
        }

        propertyRepository.delete(property);
    }
}
