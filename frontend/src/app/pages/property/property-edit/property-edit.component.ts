import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { PropertyService } from '../../../services/property.service';
import { PropertyDetail } from '../../../models/property.model';
import { PropertyRequestDto } from '../../../dto/property.dto';

import { PropertyFormComponent } from '../property-form/property-form.component';

@Component({
  selector: 'app-property-edit',
  standalone: true,
  imports: [CommonModule, PropertyFormComponent],
  templateUrl: './property-edit.component.html',
  styleUrls: ['./property-edit.component.scss']
})
export class PropertyEditComponent implements OnInit {
  /** Loaded property (UI model) */
  property: PropertyDetail | null = null;
  /** Initial form payload (DTO expected by the form/service) */
  formData: PropertyRequestDto | null = null;

  loading = true;

  constructor(
    private route: ActivatedRoute,
    private api: PropertyService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.api.getPropertyById(id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (p) => {
          this.property = p;
          this.formData = this.toRequestDto(p);
        },
        error: () => { /* Optionally toast/snack */ }
      });
  }

  /** Map UI model to the request DTO expected by backend */
  private toRequestDto(p: PropertyDetail): PropertyRequestDto {
    return {
      title: p.title,
      description: p.description ?? '',
      location: p.location,
      pricePerNight: p.pricePerNight,
      bedrooms: p.bedrooms ?? null,
      bathrooms: p.bathrooms ?? null,
      maxGuests: p.maxGuests ?? null,
      coverUrl: p.coverUrl ?? null
    };
  }
}
