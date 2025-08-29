// src/main/java/com/directloc/user/UserController.java
package com.directloc.user;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

import static com.directloc.user.UserMapper.toDto;

/**
 * User endpoints:
 * - /me for current profile
 * - Admin-only listing and detail
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final UserService userService;

    /** Current authenticated user profile. */
    @GetMapping("/me")
    public ResponseEntity<UserDto> me() {
        User u = userService.getCurrentUser();
        return ResponseEntity.ok(toDto(u));
    }

    /** List users (ADMIN only). */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<UserDto> list = userRepository.findAll()
                .stream().map(UserMapper::toDto).toList();
        return ResponseEntity.ok(list);
    }

    /** User detail (ADMIN only). */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> getUser(@PathVariable Long id) {
        User u = userRepository.findById(id).orElseThrow();
        return ResponseEntity.ok(toDto(u));
    }
}
