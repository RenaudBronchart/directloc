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

    public List<Property> findAll() {
        return propertyRepository.findAll();
    }

    public Optional<Property> findById(UUID id) {
        return propertyRepository.findById(id);
    }

    public List<Property> findMyProperties() {
        User owner = userService.getCurrentUser();
        return propertyRepository.findByOwner(owner);
    }
}
