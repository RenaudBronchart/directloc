// src/main/java/com/directloc/user/UserRepository.java
package com.directloc.user;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

/** JPA repository for User. */
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}
