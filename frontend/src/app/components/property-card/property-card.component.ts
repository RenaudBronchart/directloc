import {Component, EventEmitter, HostBinding, Input, Output} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';


export interface PropertyCardData {
  id: string;
  title: string;
  location: string;
  pricePerNight: number;
  coverUrl?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  maxGuests?: number | null;
}

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule,MatTooltipModule],
  templateUrl: './property-card.component.html',
  styleUrls: ['./property-card.component.scss']
})
export class PropertyCardComponent {
  @Input() data!: PropertyCardData;
  @Input() loading = false;
  @Output() open = new EventEmitter<string>();
  @Input() dense = false;
  @HostBinding('class.dense') get isDense() { return this.dense; }

  openCard() {
    if (!this.loading && this.data?.id) this.open.emit(this.data.id);
  }

}
