// com/directloc/userprofile/UserProfileService.java
package com.directloc.userprofile;

import com.directloc.user.User;
import com.directloc.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @RequiredArgsConstructor
public class UserProfileService {
    private final UserService userService;
    private final UserProfileRepository repo;

    public UserProfile getOrCreate() {
        User me = userService.getCurrentUser();
        return repo.findById(me.getId()).orElseGet(() -> {
            UserProfile p = UserProfile.builder()
                    .user(me)
                    .phoneVisibility(PhoneVisibility.NEVER)
                    .build();
            return repo.save(p);
        });
    }

    @Transactional
    public UserProfileDto upsert(UserProfileDto dto) {
        UserProfile p = getOrCreate();
        UserProfileMapper.apply(p, dto);
        return UserProfileMapper.toDto(repo.save(p));
    }
}
