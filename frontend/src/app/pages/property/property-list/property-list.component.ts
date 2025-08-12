import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';

import { PropertyService } from '../../../services/property.service';
import { Page, Property } from '../../../models/property.model';
import { PropertyCardComponent } from '../../../components/property-card/property-card.component';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatPaginatorModule,
    MatIconModule,
    PropertyCardComponent
  ],
  templateUrl: './property-list.component.html',
  styleUrls: ['./property-list.component.scss']
})
export class PropertyListComponent implements OnInit {
  items: Property[] = [];
  loading = true;

  // pagination
  pageIndex = 0;
  pageSize = 12;
  total = 0;

  // filtres issus de la search bar
  q = '';
  adults?: number;
  children?: number;
  rooms?: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: PropertyService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(qp => {
      this.q = qp.get('q') ?? '';
      this.adults = qp.get('adults') ? Number(qp.get('adults')) : undefined;
      this.children = qp.get('children') ? Number(qp.get('children')) : undefined;
      this.rooms = qp.get('rooms') ? Number(qp.get('rooms')) : undefined;

      // reset page on new search
      this.pageIndex = 0;
      this.load();
    });
  }

  load(): void {
    this.loading = true;
    this.api.getAll({
      q: this.q || undefined,
      adults: this.adults,
      children: this.children,
      rooms: this.rooms,
      page: this.pageIndex,
      size: this.pageSize
    }).subscribe({
      next: (res: Page<Property>) => {
        this.items = res.content;
        this.total = res.totalElements;
        this.loading = false;
      },
      error: () => {
        this.items = [];
        this.total = 0;
        this.loading = false;
      }
    });
  }

  onPage(e: PageEvent) {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.load();
  }

  trackById(_: number, p: Property) { return p.id; }

  openDetail(id: string) {
    this.router.navigate(['/properties', id]);
  }
}
