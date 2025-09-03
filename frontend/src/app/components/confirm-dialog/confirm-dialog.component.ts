// confirm-dialog.component.ts
import { Component, Inject, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  color?: 'primary' | 'accent' | 'warn';
  /** If true, focus the Cancel button first; otherwise focus Confirm. */
  preferCancelFocus?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent implements AfterViewInit {
  @ViewChild('cancelBtn') cancelBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('confirmBtn') confirmBtn!: ElementRef<HTMLButtonElement>;

  constructor(
    public ref: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  // Safe getters with sensible defaults
  get title()       { return this.data?.title ?? 'Confirm'; }
  get message()     { return this.data?.message ?? 'Are you sure?'; }
  get confirmText() { return this.data?.confirmText ?? 'Delete'; }
  get cancelText()  { return this.data?.cancelText ?? 'Cancel'; }
  get color(): 'primary' | 'accent' | 'warn' { return this.data?.color ?? 'warn'; }
  get preferCancelFocus(): boolean { return !!this.data?.preferCancelFocus; }

  ngAfterViewInit(): void {
    // Programmatic focus to avoid CDK dependency/versions issues
    const target = this.preferCancelFocus ? this.cancelBtn : this.confirmBtn;
    // Use microtask to ensure the element is in the DOM and dialog is rendered
    queueMicrotask(() => target?.nativeElement?.focus());
  }

  close(result: boolean) {
    this.ref.close(result);
  }
}
