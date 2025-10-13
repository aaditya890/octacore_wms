import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators ,ReactiveFormsModule,FormsModule} from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { AppRoutes } from '../../../core/models/app.routes.constant';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule,FormsModule,RouterLink,CommonModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder)
  private authService = inject(AuthService)
  private router = inject(Router)

  forgotPasswordForm: FormGroup
  isLoading = false
  successMessage = ""
  errorMessage = ""

  readonly AppRoutes = AppRoutes

  constructor() {
    this.forgotPasswordForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
    })
  }

  get email() {
    return this.forgotPasswordForm.get("email")
  }

  async onSubmit() {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched()
      return
    }

    this.isLoading = true
    this.errorMessage = ""
    this.successMessage = ""

    const { email } = this.forgotPasswordForm.value

    const result = await this.authService.forgotPassword(email)

    this.isLoading = false

    if (result.success) {
      this.successMessage = result.message || "Password reset link has been sent to your email."
      this.forgotPasswordForm.reset()
    } else {
      this.errorMessage = result.message || "Failed to send reset link. Please try again."
    }
  }
} 
