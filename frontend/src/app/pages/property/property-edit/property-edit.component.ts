// src/app/pages/property/property-edit/property-edit.component.ts
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { finalize, map, filter, switchMap, catchError, of, Subject, takeUntil } from 'rxjs';
import { environment } from '../../../../environments/environment';

import { PropertyService } from '../../../services/property.service';
import { PropertyDetail } from '../../../models/property.model';
import { PropertyRequestDto } from '../../../dto/property.dto';
import { PropertyFormComponent } from '../property-form/property-form.component';

@Component({
  selector: 'app-property-edit',
  standalone: true,
  imports: [CommonModule, PropertyFormComponent],
  templateUrl: './property-edit.component.html',
  styleUrls: ['./property-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PropertyEditComponent implements OnInit, OnDestroy {
  property: PropertyDetail | null = null;
  formData: PropertyRequestDto | null = null;
  loading = true;

  private readonly DEFAULT_CURRENCY =
    (environment as { defaultCurrency?: string })?.defaultCurrency ?? 'EUR';

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private api: PropertyService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // LEER ID REACTIVAMENTE y cargar
    this.route.paramMap.pipe(
      map(pm => pm.get('id')),
      filter((id): id is string => !!id),        // sólo seguimos si hay id
      switchMap(id => this.api.getPropertyById(id)),
      catchError(() => {
        // si falla la carga, dejamos la pantalla sin datos (mostraría “Loading…”),
        // pero quitamos loading para que el usuario vea algo o puedas poner un error.
        this.property = null;
        this.formData = null;
        return of(null);
      }),
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }),
      takeUntil(this.destroy$)
    ).subscribe((p) => {
      if (!p) return;
      this.property = p;
      this.formData = this.toRequestDto(p);
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Map a DTO de envío requerido por el backend */
  private toRequestDto(p: PropertyDetail): PropertyRequestDto {
    return {
      title: p.title,
      description: p.description ?? '',
      location: p.location,
      pricePerNight: p.pricePerNight,
      currency: p.currency || this.DEFAULT_CURRENCY,

      // BACK ahora espera region/city en el request
      region: p.region ?? '',
      city:   p.city   ?? '',

      bedrooms: p.bedrooms ?? null,
      bathrooms: p.bathrooms ?? null,
      maxGuests: p.maxGuests ?? null,
      beds: p.beds ?? null,
      areaM2: p.areaM2 ?? null,
      minNights: p.minNights ?? null,

      checkInFrom: p.checkInFrom ?? null,
      checkOutUntil: p.checkOutUntil ?? null,

      distanceToCenterKm: p.distanceToCenterKm ?? null,
      distanceToBeachKm: p.distanceToBeachKm ?? null,

      propertyType: p.propertyType ?? null,
      viewType: p.viewType ?? null,

      pool: !!p.pool,
      parking: !!p.parking,
      petFriendly: !!p.petFriendly,
      smokingAllowed: !!p.smokingAllowed,
      garden: !!p.garden,
      terrace: !!p.terrace,
      balcony: !!p.balcony,
      hotTub: !!p.hotTub,
      airConditioning: !!p.airConditioning,
      heating: !!p.heating,
      accessible: !!p.accessible,
      workspace: !!p.workspace,
      wifiMbps: p.wifiMbps ?? null,

      coverUrl: p.coverUrl ?? null
    };
  }
}
