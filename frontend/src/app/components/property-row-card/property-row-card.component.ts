import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PropertyModel } from '../../models/property.model';

@Component({
  selector: 'app-property-row-card',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './property-row-card.component.html',
  styleUrls: ['./property-row-card.component.scss']
})
export class PropertyRowCardComponent {
  @Input() data!: PropertyModel;
  @Input() loading = false;
  @Output() open = new EventEmitter<string>();

  placeholder = 'assets/placeholder.webp';

  constructor(private router: Router) {}

  go() {
    if (!this.loading) {
      this.open.emit(this.data.id);
      this.router.navigate(['/properties', this.data.id], {
        queryParamsHandling: 'preserve'   // keep checkIn, checkOut, adults, etc.
      });
    }
  }
}
