import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { PropertyRequest } from '../../../types/property-request.type';
import { PropertyService } from '../../../services/property.service';

@Component({
  selector: 'app-property-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './property-form.component.html',
  styleUrls: ['./property-form.component.scss']
})
export class PropertyFormComponent implements OnChanges {
  /** id présent = mode édition ; absent = création */
  @Input() id?: string | null;
  @Input() initialData?: PropertyRequest | null;

  loading = false;

  form = this.fb.group({
    title:        ['', [Validators.required, Validators.minLength(3)]],
    description:  ['', [Validators.required, Validators.minLength(10)]],
    location:     ['', [Validators.required, Validators.minLength(2)]],
    pricePerNight:[null as number | null, [Validators.required, Validators.min(0)]],
    bedrooms:     [null as number | null, [Validators.min(0)]],
    bathrooms:    [null as number | null, [Validators.min(0)]],
    maxGuests:    [null as number | null, [Validators.min(1)]],
    coverUrl:     ['']
  });

  constructor(
    private fb: FormBuilder,
    private api: PropertyService,
    private snack: MatSnackBar,
    private router: Router
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialData'] && this.initialData) {
      this.form.patchValue(this.initialData);
    }
  }

  submit(): void {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;

    // construit proprement le payload
    const v = this.form.value;
    const payload: PropertyRequest = {
      title: v.title!.trim(),
      description: v.description!.trim(),
      location: v.location!.trim(),
      pricePerNight: Number(v.pricePerNight),
      bedrooms: v.bedrooms ?? null,
      bathrooms: v.bathrooms ?? null,
      maxGuests: v.maxGuests ?? null,
      coverUrl: v.coverUrl?.trim() || null
    };

    const req$ = this.id
      ? this.api.updateProperty(this.id, payload)
      : this.api.createProperty(payload);

    req$.subscribe({
      next: () => {
        this.loading = false;
        this.snack.open(this.id ? 'Property updated ' : 'Property created ', 'Close', { duration: 2500 });
        this.router.navigate(['/my-properties']);
      },
      error: () => {
        this.loading = false;
        this.snack.open('Operation failed. Please try again.', 'Close', { duration: 3500 });
      }
    });
  }
}
