// booking/BookingController.java
package com.directloc.booking;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    private final BookingService service;
    public BookingController(BookingService service) { this.service = service; }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse create(@Valid @RequestBody BookingRequest req){
        return BookingMapper.toDto(service.createAndConfirm(req));
    }

    @GetMapping("/my")
    public List<BookingResponse> my(){
        return service.myBookings().stream().map(BookingMapper::toDto).toList();
    }

    @GetMapping("/{id}")
    public BookingResponse getById(@PathVariable Long id) {
        return BookingMapper.toDto(service.getForCurrentUser(id));
    }

}
