import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyFormComponent } from '../property-form/property-form.component';

@Component({
  selector: 'app-property-create',
  standalone: true,
  imports: [CommonModule, PropertyFormComponent],
  templateUrl: './property-create.component.html',
  styleUrls: ['./property-create.component.scss']
})
export class PropertyCreateComponent {}
