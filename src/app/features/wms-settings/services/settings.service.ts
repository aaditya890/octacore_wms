import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { NotificationService } from '../../../core/services/notification.service';

export interface Settings {
  id?: string
  companyName: string
  companyAddress?: string
  companyPhone?: string
  companyEmail?: string
  currency: string
  dateFormat: string
  timezone: string
  lowStockThreshold: number
  enableNotifications: boolean
  enableEmailAlerts: boolean
  updatedAt?: Date
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  private supabaseService = inject(SupabaseService)
  private notificationService = inject(NotificationService)

  async getSettings(): Promise<Settings | null> {
    try {
      const { data, error } = await this.supabaseService.getSettings()

      if (error) {
        this.notificationService.error("Failed to fetch settings")
        throw error
      }

      return data
    } catch (error) {
      console.error("[v0] Error fetching settings:", error)
      return null
    }
  }

  async updateSettings(settings: Partial<Settings>): Promise<boolean> {
    try {
      const { data, error } = await this.supabaseService.updateSettings(settings)

      if (error) {
        this.notificationService.error("Failed to update settings")
        throw error
      }

      this.notificationService.success("Settings updated successfully")
      return true
    } catch (error) {
      console.error("[v0] Error updating settings:", error)
      return false
    }
  }
}
