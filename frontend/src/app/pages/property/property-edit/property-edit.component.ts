import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PropertyService } from '../../../services/property.service';
import { PropertyRequest } from '../../../types/property-request.type';
import { Property } from '../../../models/property.model';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { PropertyFormComponent } from '../property-form/property-form.component';

@Component({
  selector: 'app-property-edit',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    PropertyFormComponent
  ],
  templateUrl: './property-edit.component.html',
  styleUrls: ['./property-edit.component.scss']
})
export class PropertyEditComponent implements OnInit {
  property?: Property;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private propertyService: PropertyService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.propertyService.getPropertyById(id).subscribe({
        next: (data) => (this.property = data),
        error: (err) => {
          console.error('Error fetching property', err);
          this.router.navigate(['/my-properties']);
        }
      });
    }
  }

  onSubmit(data: PropertyRequest): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.propertyService.updateProperty(id, data).subscribe({
        next: () => this.router.navigate(['/my-properties']),
        error: (err) => console.error('Update failed', err)
      });
    }
  }
}
