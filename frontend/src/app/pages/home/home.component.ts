import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { SearchBarComponent, SearchParams } from '../../components/search-bar/search-bar.component';
import { FeaturedPropertiesComponent } from '../../components/featured-properties/featured-properties.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, MatButtonModule, SearchBarComponent, FeaturedPropertiesComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  constructor(private router: Router) {}

  onSearch(p: SearchParams) {
    const toYMD = (d?: Date | null) => d ? new Date(d).toISOString().split('T')[0] : null;

    this.router.navigate(['/properties'], {
      queryParams: {
        q: p.q?.trim() || null,        // si vide -> “Anywhere”
        checkIn: toYMD(p.checkIn),
        checkOut: toYMD(p.checkOut),
        adults: p.adults,
        children: p.children,
        rooms: p.rooms,
        page: 0,
        size: 12,
        sort: 'newest'
      }
    });
  }
}
