import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { AppRoutes } from '../../../core/models/app.routes.constant';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup;
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;
  errorMessage = '';

  readonly AppRoutes = AppRoutes;

  constructor() {
    this.registerForm = this.fb.group(
      {
        full_name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        department: [''],
        role: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  get full_name() { return this.registerForm.get('full_name'); }
  get email() { return this.registerForm.get('email'); }
  get department() { return this.registerForm.get('department'); }
  get role() { return this.registerForm.get('role'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }


  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { full_name, email, password, department, role } = this.registerForm.value;
    const cleanEmail = email.trim();

    const result = await this.authService.register(
      full_name,
      cleanEmail,
      password,
      department,
      role
    );

    this.isLoading = false;

    if (result.success) {
      this.router.navigate(['/', AppRoutes.USER_MANAGEMENT, AppRoutes.USER_MANAGEMENT]);
    } else {
      this.errorMessage = result.message || 'Registration failed. Please try again.';
    }
  }
}
