// src/main/java/com/directloc/calendar/CalendarController.java
package com.directloc.calendar;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/calendar")
public class CalendarController {

    private final CalendarService service;

    public CalendarController(CalendarService service) {
        this.service = service;
    }

    @GetMapping("/guest")
    public List<CalendarEventDto> guest(
            Authentication auth,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        String email = auth.getName();
        Range r = normalize(from, to);
        return service.forGuest(email, r.from, r.to);
    }

    @GetMapping("/host")
    public List<CalendarEventDto> host(
            Authentication auth,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        String owner = auth.getName();
        Range r = normalize(from, to);
        return service.forHost(owner, r.from, r.to);
    }

    @GetMapping("/property/{id}")
    public List<CalendarEventDto> byProperty(
            @PathVariable UUID id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        Range r = normalize(from, to);
        return service.forProperty(id, r.from, r.to);
    }

    // default to current month if from/to not provided
    private static class Range { LocalDate from; LocalDate to; Range(LocalDate f, LocalDate t){ from=f; to=t; } }
    private Range normalize(LocalDate from, LocalDate to){
        if (from == null || to == null) {
            YearMonth ym = YearMonth.now();
            return new Range(ym.atDay(1), ym.plusMonths(1).atDay(1));
        }
        return new Range(from, to);
    }
}
