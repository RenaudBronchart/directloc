import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';

import { PropertyService } from '../../services/property.service';
import { Property } from '../../models/property.model';
import { PropertyCardComponent } from '../property-card/property-card.component';

type FeaturedParams = {
  q?: string;
  adults?: number;
  children?: number;
  rooms?: number;
  size?: number;   // par défaut 10
};

@Component({
  selector: 'app-featured-properties',
  standalone: true,
  imports: [CommonModule, RouterModule, MatProgressSpinnerModule, PropertyCardComponent],
  templateUrl: './featured-properties.component.html',
  styleUrls: ['./featured-properties.component.scss']
})
export class FeaturedPropertiesComponent implements OnInit {
  @Input() title = 'Newest listings';
  @Input() params: FeaturedParams | null = null;

  loading = true;
  items: Property[] = [];

  constructor(private api: PropertyService) {}

  ngOnInit(): void {
    const size = this.params?.size ?? 10;
    this.loading = true;
    this.api.getAll({
      q: this.params?.q,
      adults: this.params?.adults,
      children: this.params?.children,
      rooms: this.params?.rooms,
      page: 0,
      size
    }).subscribe({
      next: page => { this.items = page.content; this.loading = false; },
      error: () => { this.items = []; this.loading = false; }
    });
  }

  trackById(_: number, p: Property) { return p.id; }
}
