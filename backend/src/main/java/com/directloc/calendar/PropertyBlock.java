package com.directloc.calendar;

import com.directloc.property.Property;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "property_blocks")
public class PropertyBlock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    // ¡OJO! Evitar columnas "start"/"end" (reservadas). Usamos start_date / end_date
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;   // inclusive

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;     // exclusive

    @Column(length = 200)
    private String notes;

    // getters/setters
    public Long getId() { return id; }
    public Property getProperty() { return property; }
    public void setProperty(Property property) { this.property = property; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
