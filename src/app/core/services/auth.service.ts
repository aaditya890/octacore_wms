import { inject, Injectable, signal } from '@angular/core';
import { User } from '../models/user.model';
import { NotificationService } from './notification.service';
import { SupabaseService } from './supabase.service';
import { StorageService } from './storage.service';
import { Router } from '@angular/router';
import { UserService } from '../../features/user-management/services/user.service';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private userService = inject(UserService);

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
    // 🟢 ensure DB user exists even after reload
    this.userService.syncUserWithAuth();
  }

 private async restoreSession() {
  const userStr = this.storageService.getItem("current_user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      this.currentUserSignal.set(user);
      this.isAuthenticatedSignal.set(true);
    } catch (err) {
      this.clearAuthData();
    }
  }

  // 🔥 Fresh Supabase user sync
  const syncedUser = await this.userService.syncUserWithAuth();
  if (syncedUser) {
    this.storageService.setItem("current_user", JSON.stringify(syncedUser));
    this.currentUserSignal.set(syncedUser);
  }
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
      const { data, error } = await this.supabaseService.signInWithPassword(email, password);

      if (error) {
        this.notificationService.error(error.message);
        return { success: false, message: error.message };
      }

      if (data.user && data.session) {
        // 🟢 Step 1: First sync logged-in user with 'users' table
        const syncedUser = await this.userService.syncUserWithAuth();

        // 🟢 Step 2: Prepare final user object to store locally
        const user: User = syncedUser || {
          id: data.user.id,
          email: data.user.email!,
          full_name: data.user.user_metadata?.["full_name"] || data.user.email?.split("@")[0],
          role: "admin",
          department: data.user.user_metadata?.["department"] || null,
          is_active: true,
        };

        // 🟢 Step 3: Save to storage and signal
        this.storageService.setItem("auth_token", data.session.access_token);
        this.storageService.setItem("current_user", JSON.stringify(user));
        this.currentUserSignal.set(user);
        this.isAuthenticatedSignal.set(true);

        this.notificationService.success("Login successful!");
        this.router.navigate(["/dashboard"]);
        return { success: true };
      }

      return { success: false, message: "Login failed" };
    } catch (error: any) {
      console.error("Login error:", error);
      this.notificationService.error("An error occurred during login");
      return { success: false, message: error.message };
    }
  }

async register(
  full_name: string,
  email: string,
  password: string,
  department?: string,
  role: "admin" | "manager" | "staff" | "viewer" = "staff"
): Promise<{ success: boolean; message?: string }> {
  try {
    const { data, error } = await this.supabaseService.client.auth.signUp({
      email,
      password,
      options: {
        data: { full_name, department, role },
      },
    });

    if (error) {
      this.notificationService.error(error.message);
      return { success: false, message: error.message };
    }

    if (data.user) {
      const newUser: Partial<User> = {
        id: data.user.id,
        email,
        full_name,
        department,
        role,
        is_active: true,
      };

      await this.supabaseService.client.from("users").insert(newUser);

      // ✅ SYNC immediately
      const syncedUser = await this.userService.syncUserWithAuth();
      if (syncedUser) {
        this.storageService.setItem("current_user", JSON.stringify(syncedUser));
        this.currentUserSignal.set(syncedUser);
      }

      this.notificationService.success("Registration successful!");
      return { success: true };
    }

    return { success: false, message: "Registration failed" };
  } catch (error: any) {
    console.error("Registration error:", error);
    this.notificationService.error("An error occurred during registration");
    return { success: false, message: error.message };
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
