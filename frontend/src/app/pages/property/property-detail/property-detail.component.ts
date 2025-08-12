// src/app/pages/property/property-detail/property-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';

import { PropertyService } from '../../../services/property.service';
import { PropertyDetail } from '../../../models/property.model';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatCardModule   // 👈 indispensable pour <mat-card> / <mat-card-content>
  ],
  templateUrl: './property-detail.component.html',
  styleUrls: ['./property-detail.component.scss']
})
export class PropertyDetailComponent implements OnInit {
  property: PropertyDetail | null = null;
  loading = true;
  placeholder = 'assets/placeholder.webp';

  constructor(private route: ActivatedRoute, private api: PropertyService) {}
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.api.getPropertyById(id).subscribe({
      next: p => { this.property = p; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
