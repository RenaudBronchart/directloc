// src/app/pages/property/my-properties/my-properties.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { PropertyService } from '../../../services/property.service';
import { PropertyModel } from '../../../models/property.model';
import { PropertyCardComponent } from '../../../components/property-card/property-card.component';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-my-properties',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
    PropertyCardComponent
  ],
  templateUrl: './my-properties.component.html',
  styleUrls: ['./my-properties.component.scss']
})
export class MyPropertiesComponent implements OnInit {
  items: PropertyModel[] = [];
  loading = true;

  constructor(
    private api: PropertyService,
    private dialog: MatDialog,
    private router: Router,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void { this.load(); }

  /** Fetch current user's properties */
  load(): void {
    this.loading = true;
    this.api.getMyProperties().subscribe({
      next: res => { this.items = res; this.loading = false; },
      error: () => { this.items = []; this.loading = false; }
    });
  }

  /** Navigate to create form */
  openCreate(): void {
    this.router.navigate(['/properties/create']);
  }

  /** Navigate to public detail page */
  openDetail(id: string): void {
    this.router.navigate(['/properties', id]);
  }

  /** Navigate to edit form */
  openEdit(id: string): void {
    this.router.navigate(['/properties/edit', id]);
  }

  /** TrackBy for ngFor */
  trackById(_: number, p: PropertyModel): string {
    return p.id;
  }

  /** Delete with confirmation dialog */
  delete(id: string): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete property',
        message: 'This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.api.deleteProperty(id).subscribe({
        next: () => {
          this.items = this.items.filter(p => p.id !== id);
          this.snack.open('Property deleted.', 'Close', { duration: 2500 });
        },
        error: () => {
          this.snack.open('Delete failed. Please try again.', 'Close', { duration: 3500 });
        }
      });
    });
  }
}
