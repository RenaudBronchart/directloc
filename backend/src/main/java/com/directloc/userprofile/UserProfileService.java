// src/main/java/com/directloc/userprofile/UserProfileService.java
package com.directloc.userprofile;

import com.directloc.user.User;
import com.directloc.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserService userService;
    private final UserProfileRepository repo;
    private final AvatarStorage storage; // see below

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

    public ProfileDto me() {
        User me = userService.getCurrentUser();
        UserProfile p = getOrCreate();
        return UserProfileMapper.toReadDto(me, p);
    }

    @Transactional
    public ProfileDto update(UpdateProfileDto dto) {
        User me = userService.getCurrentUser();
        UserProfile p = getOrCreate();
        UserProfileMapper.applyUpdate(p, dto);
        return UserProfileMapper.toReadDto(me, repo.save(p));
    }

    @Transactional
    public String updateAvatar(MultipartFile file) {
        User me = userService.getCurrentUser();
        UserProfile p = getOrCreate();
        String url = storage.store(me.getId(), file);
        p.setAvatarUrl(url);
        repo.save(p);
        return url;
    }
}
