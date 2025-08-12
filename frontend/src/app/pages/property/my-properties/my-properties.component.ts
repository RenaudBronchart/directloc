import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { PropertyService } from '../../../services/property.service';
import { Property } from '../../../models/property.model';
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
    PropertyCardComponent
  ],
  templateUrl: './my-properties.component.html',
  styleUrls: ['./my-properties.component.scss']
})
export class MyPropertiesComponent implements OnInit {
  items: Property[] = [];
  loading = true;

  constructor(
    private api: PropertyService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.getMyProperties().subscribe({
      next: res => { this.items = res; this.loading = false; },
      error: () => { this.items = []; this.loading = false; }
    });
  }

  openCreate() {
    this.router.navigate(['/properties/create']);
  }

  openDetail(id: string) {
    this.router.navigate(['/properties', id]);
  }

  openEdit(id: string) {
    this.router.navigate(['/properties/edit', id]);
  }
  trackById(_: number, p: Property): string {
    return p.id;
  }

  delete(id: string) {
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
        next: () => this.items = this.items.filter(p => p.id !== id),
        error: () => {/* tu peux afficher un snack si besoin */}
      });
    });
  }
}
