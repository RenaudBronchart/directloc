import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PropertyRequest } from '../../../types/property-request.type';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-property-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './property-form.component.html',
  styleUrls: ['./property-form.component.scss']
})
export class PropertyFormComponent implements OnInit {
  @Input() initialData?: PropertyRequest; // Used for edit
  @Output() submit = new EventEmitter<PropertyRequest>();

  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      title: [this.initialData?.title || '', Validators.required],
      description: [this.initialData?.description || '', Validators.required],
      location: [this.initialData?.location || '', Validators.required],
      pricePerNight: [
        this.initialData?.pricePerNight ?? null,
        [Validators.required, Validators.min(1)]
      ]
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.submit.emit(this.form.value);
    }
  }
}
