import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PropertyService } from '../../../services/property.service';
import { PropertyRequest } from '../../../types/property-request.type';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { PropertyFormComponent } from '../property-form/property-form.component';

@Component({
  selector: 'app-property-create',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    PropertyFormComponent
  ],
  templateUrl: './property-create.component.html',
  styleUrls: ['./property-create.component.scss']
})
export class PropertyCreateComponent {

  constructor(
    private propertyService: PropertyService,
    private router: Router
  ) {}

  onSubmit(data: PropertyRequest) {
    this.propertyService.createProperty(data).subscribe({
      next: () => this.router.navigate(['/my-properties']),
      error: err => console.error('Create error:', err)
    });
  }
}
