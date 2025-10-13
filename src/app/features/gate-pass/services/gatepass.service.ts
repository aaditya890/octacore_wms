import { inject, Injectable } from '@angular/core';
import { GatePass, GatePassFilter } from '../../../core/models/gatepass.model';
import { SupabaseService } from '../../../core/services/supabase.service';
import { NotificationService } from '../../../core/services/notification.service';

@Injectable({
  providedIn: 'root'
})
export class GatepassService {
 private supabaseService = inject(SupabaseService)
  private notificationService = inject(NotificationService)

  async getGatePassList(filter?: GatePassFilter): Promise<GatePass[]> {
    try {
      let query = this.supabaseService.from("gate_passes").select("*")

      if (filter?.pass_type) {
        query = query.eq("pass_type", filter.pass_type)
      }

      if (filter?.status) {
        query = query.eq("status", filter.status)
      }

      if (filter?.date_from) {
        query = query.gte("date", filter.date_from.toString())
      }

      if (filter?.date_to) {
        query = query.lte("date", filter.date_to.toString())
      }

      if (filter?.search_term) {
        query = query.or(`gate_pass_number.ilike.%${filter.search_term}%,vehicle_number.ilike.%${filter.search_term}%`)
      }

      const { data, error } = await query.order("date", { ascending: false })

      if (error) {
        this.notificationService.error("Failed to fetch gate passes")
        throw error
      }

      return data || []
    } catch (error) {
      console.error("[v0] Error fetching gate passes:", error)
      return []
    }
  }

  async addGatePass(gatePass: GatePass): Promise<boolean> {
    try {
      const { data, error } = await this.supabaseService.from("gate_passes").insert(gatePass).select().single()

      if (error) {
        this.notificationService.error("Failed to create gate pass")
        throw error
      }

      this.notificationService.success("Gate pass created successfully")
      return true
    } catch (error) {
      console.error("[v0] Error creating gate pass:", error)
      return false
    }
  }

  async updateGatePass(id: string, gatePass: Partial<GatePass>): Promise<boolean> {
    try {
      const { data, error } = await this.supabaseService
        .from("gate_passes")
        .update(gatePass)
        .eq("id", id)
        .select()
        .single()

      if (error) {
        this.notificationService.error("Failed to update gate pass")
        throw error
      }

      this.notificationService.success("Gate pass updated successfully")
      return true
    } catch (error) {
      console.error("[v0] Error updating gate pass:", error)
      return false
    }
  }

  async approveGatePass(id: string, approved_by: string): Promise<boolean> {
    return this.updateGatePass(id, { status: "approved", approved_by })
  }

  async rejectGatePass(id: string): Promise<boolean> {
    return this.updateGatePass(id, { status: "rejected" })
  }
}
