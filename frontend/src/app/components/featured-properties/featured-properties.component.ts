// src/app/components/featured-properties/featured-properties.component.ts
import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { PropertyService } from '../../services/property.service';
import { PropertyModel } from '../../models/property.model';
import { PropertyCardComponent } from '../property-card/property-card.component';

type FeaturedParams = {
  q?: string;
  adults?: number;
  children?: number;
  rooms?: number;
  size?: number;  // default 10
};

@Component({
  selector: 'app-featured-properties',
  standalone: true,
  imports: [CommonModule, RouterModule, MatProgressSpinnerModule, PropertyCardComponent],
  templateUrl: './featured-properties.component.html',
  styleUrls: ['./featured-properties.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeaturedPropertiesComponent implements OnInit, OnChanges, OnDestroy {
  /** Section title */
  @Input() title = 'Newest listings';
  /** Request params (changing them refetches) */
  @Input() params: FeaturedParams | null = null;
  /** “View all” link visibility and target */
  @Input() showLink = true;
  @Input() linkTo: string | any[] = '/properties';
  /** Empty message */
  @Input() emptyText = 'No listings yet.';

  loading = true;
  items: PropertyModel[] = [];

  private readonly destroy$ = new Subject<void>();

  constructor(
    private api: PropertyService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void { this.fetch(); }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['params'] && !changes['params'].firstChange) {
      this.fetch();
    }
  }

  private fetch(): void {
    this.loading = true;
    this.cdr.markForCheck(); // fuerza repintado del spinner

    const size = this.params?.size ?? 8;

    this.api.getAll({
      q: this.params?.q,
      adults: this.params?.adults,
      children: this.params?.children,
      rooms: this.params?.rooms,
      page: 0,
      size
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (page) => {
          this.items = page?.content ?? [];
          this.loading = false;
          this.cdr.markForCheck(); // repinta la lista
        },
        error: () => {
          this.items = [];
          this.loading = false;
          this.cdr.markForCheck(); // repinta estado vacío
        }
      });
  }

  trackById(_: number, p: PropertyModel) { return p.id; }

  go(id: string) {
    this.router.navigate(['/properties', id]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
