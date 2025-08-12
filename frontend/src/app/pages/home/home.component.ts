import { Component, OnInit } from '@angular/core';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { FeaturedPropertiesComponent } from '../../components/featured-properties/featured-properties.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, MatButtonModule, SearchBarComponent, FeaturedPropertiesComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  filters: any = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const qp = this.route.snapshot.queryParamMap;
    if (qp.keys.length) {
      this.filters = {
        q: qp.get('q') || undefined,
        adults: qp.get('adults') ? +qp.get('adults')! : undefined,
        children: qp.get('children') ? +qp.get('children')! : undefined,
        rooms: qp.get('rooms') ? +qp.get('rooms')! : undefined,
      };
    }
  }

  onSearch(ev: any) {
    this.filters = {
      q: ev.q,
      adults: ev.adults,
      children: ev.children,
      rooms: ev.rooms
    };
  }
}
