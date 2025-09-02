// src/app/pages/calendar/block-dialog/block-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';

import { CalendarService } from '../../../services/calendar.service';
import { PropertyService } from '../../../services/property.service';
import { PropertyModel } from '../../../models/property.model';

type DialogData = { propertyId: string | null };

@Component({
  standalone: true,
  selector: 'app-block-dialog',
  imports: [
    CommonModule, ReactiveFormsModule,
    MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule,
    MatDatepickerModule, MatNativeDateModule, MatSelectModule, MatSnackBarModule
  ],
  templateUrl: './block-dialog.component.html',
  styleUrls: ['./block-dialog.component.scss']
})
export class BlockDialogComponent {
  loading = false;
  saving = false;

  myProps: PropertyModel[] = [];

  form = this.fb.group({
    propertyId: ['', Validators.required],
    start: [null as Date | null, Validators.required],
    end:   [null as Date | null, Validators.required],
    reason: ['']
  });

  constructor(
    private fb: FormBuilder,
    private cal: CalendarService,
    private props: PropertyService,
    private snack: MatSnackBar,
    private ref: MatDialogRef<BlockDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  ngOnInit(): void {
    if (this.data?.propertyId) this.form.controls.propertyId.setValue(this.data.propertyId);

    this.loading = true;
    this.props.getMyProperties()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: list => { this.myProps = list || []; },
        error: () => { this.snack.open('Could not load your properties.', 'Close', { duration: 2500 }); }
      });
  }

  private ymd(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  save(): void {
    if (this.form.invalid || this.saving) return;

    const v = this.form.getRawValue();
    const from = this.ymd(v.start!); // 👈 usa nombres consistentes
    const to   = this.ymd(v.end!);

    if (to <= from) {
      this.snack.open('End date must be after start date.', 'Close', { duration: 2500 });
      return;
    }

    this.saving = true;
    this.cal.createBlock({
      propertyId: v.propertyId!,
      from,
      to,
      reason: v.reason?.trim() || undefined
    })
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => this.ref.close(true),
        error: () => this.snack.open('Could not create block.', 'Close', { duration: 2500 })
      });
  }

  cancel(): void { this.ref.close(false); }
}
