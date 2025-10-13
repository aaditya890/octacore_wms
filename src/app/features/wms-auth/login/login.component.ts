import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators ,ReactiveFormsModule,FormsModule} from '@angular/forms';
import { AppRoutes } from '../../../core/models/app.routes.constant';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule,FormsModule,RouterLink,CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
   private fb = inject(FormBuilder)
  private authService = inject(AuthService)
  private router = inject(Router)

  loginForm: FormGroup
  isLoading = false
  showPassword = false
  errorMessage = ""

  readonly AppRoutes = AppRoutes

  constructor() {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    })
  }

  get email() {
    return this.loginForm.get("email")
  }

  get password() {
    return this.loginForm.get("password")
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched()
      return
    }

    this.isLoading = true
    this.errorMessage = ""

    const { email, password } = this.loginForm.value

    const result = await this.authService.login(email, password)

    this.isLoading = false

    if (!result.success) {
      this.errorMessage = result.message || "Login failed. Please try again."
    }
  }
}
