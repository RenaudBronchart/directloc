package com.directloc.userprofile;

import com.directloc.user.User;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

final class UserProfileMapper {
    private UserProfileMapper() {}
    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE;

    /** Build a read DTO the UI expects. */
    static ProfileDto toReadDto(User user, UserProfile p) {
        return new ProfileDto(
                user.getEmail(),
                emptyToNull(p.getAvatarUrl()),

                emptyToNull(p.getFirstName()),
                emptyToNull(p.getLastName()),

                emptyToNull(p.getPhone()),
                emptyToNull(p.getPhoneCountry()),
                p.getPhoneVisibility(),

                p.getGender(),
                emptyToNull(p.getNationality()),
                p.getDateOfBirth() == null ? null : ISO.format(p.getDateOfBirth()),

                emptyToNull(p.getLocale()),
                emptyToNull(p.getTimezone()),

                p.getWantsToHost()
        );
    }

    /** Apply a partial update coming from the UI. */
    static void applyUpdate(UserProfile p, UpdateProfileDto dto) {
        if (dto == null) return;

        if (dto.fullName() != null)       splitName(dto.fullName(), p);
        if (dto.phone() != null)          p.setPhone(trim(dto.phone()));
        if (dto.phoneCountry() != null)   p.setPhoneCountry(upper2(dto.phoneCountry()));
        if (dto.phoneVisibility() != null)p.setPhoneVisibility(dto.phoneVisibility());
        if (dto.gender() != null)         p.setGender(dto.gender());
        if (dto.nationality() != null)    p.setNationality(upper2(dto.nationality()));
        if (dto.dateOfBirth() != null)    p.setDateOfBirth(parseDate(dto.dateOfBirth()));
        if (dto.locale() != null)         p.setLocale(trim(dto.locale()));
        if (dto.timezone() != null)       p.setTimezone(trim(dto.timezone()));
        if (dto.wantsToHost() != null)    p.setWantsToHost(dto.wantsToHost());
    }

    /** Split "First Last" to firstName / lastName (simple heuristic). */
    private static void splitName(String fullName, UserProfile p) {
        String s = trim(fullName);
        if (s.isEmpty()) {
            p.setFirstName(null);
            p.setLastName(null);
            return;
        }
        String[] parts = s.split("\\s+", 2);
        p.setFirstName(parts[0]);
        p.setLastName(parts.length > 1 ? parts[1] : null);
    }

    private static LocalDate parseDate(String s) {
        s = trim(s);
        if (s.isEmpty()) return null;
        try { return LocalDate.parse(s, ISO); }
        catch (DateTimeParseException e) { return null; } // ignora formato inválido
    }

    private static String upper2(String s) {
        s = trim(s);
        return s.isEmpty() ? null : s.toUpperCase();
    }
    private static String trim(String s) { return s == null ? "" : s.trim(); }
    private static String emptyToNull(String s) { String t = trim(s); return t.isEmpty() ? null : t; }
}
