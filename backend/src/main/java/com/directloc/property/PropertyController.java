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

    @PostMapping
    public ResponseEntity<Property> create(@RequestBody PropertyRequest request) {
        Property property = propertyService.create(request);
        return ResponseEntity.status(201).body(property); // 201 Created
    }


    @GetMapping
    public ResponseEntity<List<Property>> findAll() {
        return ResponseEntity.ok(propertyService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Property> findById(@PathVariable UUID id) {
        return propertyService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/my")
    public ResponseEntity<List<Property>> findMyProperties() {
        return ResponseEntity.ok(propertyService.findMyProperties());
    }
}
