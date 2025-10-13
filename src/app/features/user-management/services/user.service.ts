import { inject, Injectable } from '@angular/core';
import { User, UserFilter } from '../../../core/models/user.model';
import { SupabaseService } from '../../../core/services/supabase.service';
import { NotificationService } from '../../../core/services/notification.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private supabaseService = inject(SupabaseService)
  private notificationService = inject(NotificationService)

  async getUserList(filter?: UserFilter): Promise<User[]> {
    try {
      let query = this.supabaseService.from("users").select("*")

      if (filter?.role) {
        query = query.eq("role", filter.role)
      }

      if (filter?.) {
        query = query.eq("status", filter.status)
      }

      if (filter?.department) {
        query = query.eq("department", filter.department)
      }

      if (filter?.searchTerm) {
        query = query.or(
          `firstName.ilike.%${filter.searchTerm}%,lastName.ilike.%${filter.searchTerm}%,email.ilike.%${filter.searchTerm}%`,
        )
      }

      const { data, error } = await query.order("firstName", { ascending: true })

      if (error) {
        this.notificationService.error("Failed to fetch users")
        throw error
      }

      return data || []
    } catch (error) {
      console.error("[v0] Error fetching users:", error)
      return []
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const { data, error } = await this.supabaseService.getUserById(id)

      if (error) {
        this.notificationService.error("Failed to fetch user")
        throw error
      }

      return data
    } catch (error) {
      console.error("[v0] Error fetching user:", error)
      return null
    }
  }

  async updateUser(id: string, user: Partial<User>): Promise<boolean> {
    try {
      const { data, error } = await this.supabaseService.updateUser(id, user)

      if (error) {
        this.notificationService.error("Failed to update user")
        throw error
      }

      this.notificationService.success("User updated successfully")
      return true
    } catch (error) {
      console.error("[v0] Error updating user:", error)
      return false
    }
  }
}
