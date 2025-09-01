// src/main/java/com/directloc/userprofile/UserProfileController.java
package com.directloc.userprofile;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService service;

    @GetMapping
    public ResponseEntity<ProfileDto> meProfile() {
        return ResponseEntity.ok(service.me());
    }

    @PutMapping
    public ResponseEntity<ProfileDto> save(@Valid @RequestBody UpdateProfileDto dto) {
        return ResponseEntity.ok(service.update(dto));
    }

    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file) {
        String avatarUrl = service.updateAvatar(file);
        return ResponseEntity.ok().body(java.util.Map.of("avatarUrl", avatarUrl));
    }
}
