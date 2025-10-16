import { inject, Injectable, signal } from '@angular/core';
import { User } from '../models/user.model';
import { NotificationService } from './notification.service';
import { SupabaseService } from './supabase.service';
import { StorageService } from './storage.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  
  private storageService = inject(StorageService)
  private router = inject(Router)
  private supabaseService = inject(SupabaseService)
  private notificationService = inject(NotificationService)

  private currentUserSignal = signal<User | null>(null)
  private isAuthenticatedSignal = signal<boolean>(false)

  currentUser = this.currentUserSignal.asReadonly()
  isAuthenticated = this.isAuthenticatedSignal.asReadonly()

constructor() {
  this.restoreSession();
}

private async restoreSession() {
  const userStr = this.storageService.getItem("current_user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      this.currentUserSignal.set(user);
      this.isAuthenticatedSignal.set(true);
    } catch (err) {
      console.error('Failed to restore session:', err);
      this.clearAuthData();
    }
  }

  // Optional: double verify with supabase session
  await this.checkAuthStatus();
}

  private async checkAuthStatus() {
    const {
      data: { session },
    } = await this.supabaseService.getSession()

    if (session) {
      const userStr = this.storageService.getItem("current_user")
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          this.currentUserSignal.set(user)
          this.isAuthenticatedSignal.set(true)
        } catch (error) {
          console.error("[v0] Failed to parse user data:", error)
          this.clearAuthData()
        }
      }
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; message?: string }> {
    try {
      const { data, error } = await this.supabaseService.signInWithPassword(email, password)

      if (error) {
        this.notificationService.error(error.message)
        return { success: false, message: error.message }
      }

      if (data.user && data.session) {
        const { data: userProfile, error: profileError } = await this.supabaseService
          .from("users")
          .select("*")
          .eq("email", email)
          .single()

        const user: User = userProfile || {
          id: data.user.id,
          email: data.user.email!,
          first_name: data.user.user_metadata?.["first_name"] || "",
          last_name: data.user.user_metadata?.["last_name"] || "",
          role: "staff",
          status: "active",
        }

        this.storageService.setItem("auth_token", data.session.access_token)
        this.storageService.setItem("current_user", JSON.stringify(user))

        this.currentUserSignal.set(user)
        this.isAuthenticatedSignal.set(true)

        this.notificationService.success("Login successful!")
        this.router.navigate(["/dashboard"])

        return { success: true }
      }

      return { success: false, message: "Login failed" }
    } catch (error: any) {
      this.notificationService.error("An error occurred during login")
      return { success: false, message: error.message }
    }
  }

  async register(
    first_name: string,
    last_name: string,
    email: string,
    password: string,
    department?: string,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const { data, error } = await this.supabaseService.signUp(email, password, {
        first_name,
        last_name,
        department,
      })

      if (error) {
        this.notificationService.error(error.message)
        return { success: false, message: error.message }
      }

      if (data.user) {
        const newUser: Partial<User> = {
          id: data.user.id,
          email: email,
          full_name: first_name,
          department: department,
          role: "staff",
          is_active: true,
        }

        await this.supabaseService.from("users").insert(newUser)
        this.notificationService.success("Registration successful! Please check your email to verify your account.")
        return { success: true, message: "Registration successful! Please login." }
      }

      return { success: false, message: "Registration failed" }
    } catch (error: any) {
      this.notificationService.error("An error occurred during registration")
      return { success: false, message: error.message }
    }
  }

  async logout() {
    try {
      await this.supabaseService.signOut()
      this.clearAuthData()
      this.currentUserSignal.set(null)
      this.isAuthenticatedSignal.set(false)
      this.notificationService.success("Logged out successfully")
      this.router.navigate(["/auth/login"])
    } catch (error: any) {
      this.notificationService.error("Error during logout")
    }
  }

  async forgotPassword(email: string): Promise<{ success: boolean; message?: string }> {
    try {
      const { error } = await this.supabaseService.resetPasswordForEmail(email)
      if (error) {
        this.notificationService.error(error.message)
        return { success: false, message: error.message }
      }

      this.notificationService.success("Password reset link has been sent to your email.")
      return {
        success: true,
        message: "Password reset link has been sent to your email.",
      }
    } catch (error: any) {
      this.notificationService.error("An error occurred")
      return { success: false, message: error.message }
    }
  }

  getToken(): string | null {
    return this.storageService.getItem("auth_token")
  }

  private clearAuthData() {
    this.storageService.removeItem("auth_token")
    this.storageService.removeItem("current_user")
  }

  getCurrentUser(): User | null {
    return this.currentUserSignal();
  }


  hasRole(...roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }


  isLoggedIn(): boolean {
    return this.isAuthenticatedSignal();
  }

  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }
}
