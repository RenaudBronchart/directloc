package com.directloc.user;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.directloc.user.UserMapper.toDto;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final UserService userService;

    // Profil courant (authentifié)
    @GetMapping("/me")
    public ResponseEntity<UserDto> me() {
        User u = userService.getCurrentUser();
        return ResponseEntity.ok(toDto(u));
    }

    // Liste des utilisateurs (ADMIN uniquement)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<UserDto> list = userRepository.findAll()
                .stream().map(UserMapper::toDto).toList();
        return ResponseEntity.ok(list);
    }

    // Détail d’un user (ADMIN uniquement)
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> getUser(@PathVariable Long id) {
        User u = userRepository.findById(id).orElseThrow();
        return ResponseEntity.ok(toDto(u));
    }
}
