// src/main/java/com/directloc/userprofile/LocalAvatarStorage.java
package com.directloc.userprofile;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;

@Component
@RequiredArgsConstructor
public class LocalAvatarStorage implements AvatarStorage {

    @Value("${app.uploads.avatars-dir:uploads/avatars}")
    private String rootDir;

    @Value("${app.uploads.public-base:/uploads/avatars}")
    private String publicBase; // served as static resources

    @Override
    public String store(Long userId, MultipartFile file) {
        try {
            String ext = StringUtils.getFilenameExtension(file.getOriginalFilename());
            String safeExt = (ext == null || ext.length() > 8) ? "bin" : ext.toLowerCase();
            String name = userId + "_" + Instant.now().toEpochMilli() + "." + safeExt;

            Path root = Path.of(rootDir).toAbsolutePath().normalize();
            Files.createDirectories(root);
            Path target = root.resolve(name);
            file.transferTo(target);

            // Assumes StaticResource mapping: classpath:/static or external mapping of /uploads/**
            return publicBase.endsWith("/")
                    ? publicBase + name
                    : publicBase + "/" + name;
        } catch (IOException e) {
            throw new RuntimeException("Avatar upload failed", e);
        }
    }
}
