package com.directloc.userprofile;

import org.springframework.web.multipart.MultipartFile;

public interface AvatarStorage {
    /** Stores the file and returns an absolute or web-accessible URL. */
    String store(Long userId, MultipartFile file);
}
