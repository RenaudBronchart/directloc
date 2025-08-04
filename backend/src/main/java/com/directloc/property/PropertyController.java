package com.directloc.property;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/properties")
@RequiredArgsConstructor
public class PropertyController {

    private final PropertyService propertyService;

    // Creates a new property based on the request payload
    @PostMapping
    public ResponseEntity<Property> create(@RequestBody PropertyRequest request) {
        Property property = propertyService.create(request);
        return ResponseEntity.status(201).body(property); // HTTP 201 Created
    }

    // Updates an existing property by its ID
    @PutMapping("/{id}")
    public ResponseEntity<Property> update(@PathVariable UUID id, @RequestBody PropertyRequest request) {
        Property updated = propertyService.update(id, request);
        return ResponseEntity.ok(updated); // HTTP 200 OK with updated property
    }

    // Deletes a property by its ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        propertyService.delete(id);
        return ResponseEntity.noContent().build(); // HTTP 204 No Content
    }

    // Retrieves all properties
    @GetMapping
    public ResponseEntity<List<Property>> findAll() {
        return ResponseEntity.ok(propertyService.findAll());
    }

    // Retrieves a single property by its ID
    @GetMapping("/{id}")
    public ResponseEntity<Property> findById(@PathVariable UUID id) {
        return propertyService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build()); // HTTP 404 if not found
    }

    // Retrieves properties owned by the current authenticated user
    @GetMapping("/my")
    public ResponseEntity<List<Property>> findMyProperties() {
        return ResponseEntity.ok(propertyService.findMyProperties());
    }
}
