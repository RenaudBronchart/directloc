// com/directloc/userprofile/UserProfileController.java
package com.directloc.userprofile;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService service;

    @GetMapping
    public ResponseEntity<UserProfileDto> meProfile() {
        return ResponseEntity.ok(UserProfileMapper.toDto(service.getOrCreate()));
    }

    @PutMapping
    public ResponseEntity<UserProfileDto> save(@RequestBody UserProfileDto dto) {
        return ResponseEntity.ok(service.upsert(dto));
    }
}
