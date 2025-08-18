import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PropertyService } from '../../../services/property.service';
import { PropertyDetail } from '../../../models/property.model';
import { PropertyRequest } from '../../../types/property-request.type';

// adapte le chemin si ton form est ailleurs
import { PropertyFormComponent } from '../property-form/property-form.component';

@Component({
  selector: 'app-property-edit',
  standalone: true,
  imports: [CommonModule, PropertyFormComponent],
  templateUrl: './property-edit.component.html',
  styleUrls: ['./property-edit.component.scss']
})
export class PropertyEditComponent implements OnInit {
  property: PropertyDetail | null = null;
  formData: PropertyRequest | null = null;
  loading = true;

  constructor(private route: ActivatedRoute, private api: PropertyService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.api.getPropertyById(id).subscribe({
      next: (p) => {
        this.property = p;
        this.formData = this.toRequest(p);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  private toRequest(p: PropertyDetail): PropertyRequest {
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
