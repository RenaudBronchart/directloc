import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  email = '';
  password = '';
  confirm = '';
  acceptTos = false;

  hidePwd = true;
  hideConfirm = true;
  loading = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private snack: MatSnackBar
  ) {}

  get passwordsMismatch(): boolean {
    return !!this.password && !!this.confirm && this.password !== this.confirm;
  }

  onSubmit(form: NgForm): void {
    if (form.invalid || this.passwordsMismatch || !this.acceptTos || this.loading) {
      form.control.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.auth.register({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.snack.open('Welcome to DirectLoc! 🎉', 'Close', { duration: 2500 });
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.status === 409 ? 'This email is already in use.' : 'Registration failed.';
        this.snack.open(msg, 'Close', { duration: 3500 });
      }
    });
  }
}
