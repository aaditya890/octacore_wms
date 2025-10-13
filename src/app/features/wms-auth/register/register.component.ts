import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule,FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { AppRoutes } from '../../../core/models/app.routes.constant';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink,CommonModule,ReactiveFormsModule,FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
    private fb = inject(FormBuilder)
  private authService = inject(AuthService)
  private router = inject(Router)

  registerForm: FormGroup
  isLoading = false
  showPassword = false
  showConfirmPassword = false
  errorMessage = ""

  readonly AppRoutes = AppRoutes

  constructor() {
    this.registerForm = this.fb.group(
      {
        firstName: ["", [Validators.required, Validators.minLength(2)]],
        lastName: ["", [Validators.required, Validators.minLength(2)]],
        email: ["", [Validators.required, Validators.email]],
        department: [""],
        password: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", [Validators.required]],
        agreeToTerms: [false, [Validators.requiredTrue]],
      },
      { validators: this.passwordMatchValidator },
    )
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get("password")
    const confirmPassword = form.get("confirmPassword")

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true })
      return { passwordMismatch: true }
    }

    return null
  }

  get firstName() {
    return this.registerForm.get("firstName")
  }

  get lastName() {
    return this.registerForm.get("lastName")
  }

  get email() {
    return this.registerForm.get("email")
  }

  get department() {
    return this.registerForm.get("department")
  }

  get password() {
    return this.registerForm.get("password")
  }

  get confirmPassword() {
    return this.registerForm.get("confirmPassword")
  }

  get agreeToTerms() {
    return this.registerForm.get("agreeToTerms")
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword
  }

  async onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched()
      return
    }

    this.isLoading = true
    this.errorMessage = ""

    const { firstName, lastName, email, password, department } = this.registerForm.value

    const result = await this.authService.register(firstName, lastName, email, password, department)

    this.isLoading = false

    if (result.success) {
      this.router.navigate(["/", AppRoutes.AUTH, AppRoutes.LOGIN])
    } else {
      this.errorMessage = result.message || "Registration failed. Please try again."
    }
  }
}
