package com.directloc.messaging;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessagingController {

    private final MessagingService service;
    private final MessagingMapper mapper;

    /** Open/reuse GENERAL conversation (property only). */
    @PostMapping("/open-general")
    public ConversationSummaryDto openGeneral(@RequestBody OpenGeneralRequest req) {
        var c = service.openGeneral(req.propertyId());
        return mapper.toSummaryDto(c);
    }

    /** Open/reuse BOOKING conversation (per booking). */
    @PostMapping("/open-booking")
    public ConversationSummaryDto openBooking(@RequestBody OpenBookingRequest req) {
        var c = service.openForBooking(req.bookingId());
        return mapper.toSummaryDto(c);
    }

    /** List conversation summaries for current user (projection). */
    @GetMapping("/conversations")
    public Page<ConversationSummary> list(Pageable pageable) {
        return service.listMyConversations(pageable);
    }

    /** List messages in a conversation (ASC) as DTOs. */
    @GetMapping("/{id}/messages")
    public Page<MessageDto> messages(@PathVariable Long id, Pageable pageable) {
        return service.listMessages(id, pageable).map(mapper::toDto);
    }

    /** Send a message. */
    @PostMapping("/{id}")
    public MessageDto send(@PathVariable Long id, @RequestBody SendMessageRequest req) {
        return mapper.toDto(service.send(id, req.body()));
    }

    /** Mark as read / archive / unarchive. */
    @PatchMapping("/{id}/read") public void markRead(@PathVariable Long id) { service.markRead(id); }
    @PatchMapping("/{id}/archive") public void archive(@PathVariable Long id) { service.archive(id); }
    @PatchMapping("/{id}/unarchive") public void unarchive(@PathVariable Long id) { service.unarchive(id); }

    // Payloads
    public record OpenGeneralRequest(@NotNull java.util.UUID propertyId) {}
    public record OpenBookingRequest(@NotNull Long bookingId) {}
    public record SendMessageRequest(@NotBlank String body) {}
}
