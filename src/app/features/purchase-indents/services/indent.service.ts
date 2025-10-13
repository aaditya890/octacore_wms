import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { NotificationService } from '../../../core/services/notification.service';
import { IndentFilter, PurchaseIndent } from '../../../core/models/indent.model';

@Injectable({
  providedIn: 'root'
})
export class IndentService {
  private supabaseService = inject(SupabaseService)
  private notificationService = inject(NotificationService)

  async getIndentList(filter?: IndentFilter): Promise<PurchaseIndent[]> {
    try {
      let query = this.supabaseService.from("purchase_indents").select("*")

      if (filter?.status) {
        query = query.eq("status", filter.status)
      }

      if (filter?.priority) {
        query = query.eq("priority", filter.priority)
      }

      if (filter?.department) {
        query = query.eq("department", filter.department)
      }

      if (filter?.date_from) {
        query = query.gte("required_date", filter.date_from)
      }

      if (filter?.date_to) {
        query = query.lte("required_date", filter.date_to)
      }

      if (filter?.search_term) {
        query = query.or(
          `indent_number.ilike.%${filter.search_term}%,title.ilike.%${filter.search_term}%,requested_by.ilike.%${filter.search_term}%`,
        )
      }

      const { data, error } = await query.order("required_date", { ascending: false })

      if (error) {
        this.notificationService.error("Failed to fetch purchase indents")
        throw error
      }

      return data || []
    } catch (error) {
      console.error("[v0] Error fetching indents:", error)
      return []
    }
  }

  async addIndent(indent: PurchaseIndent): Promise<boolean> {
    try {
      const { data, error } = await this.supabaseService.from("purchase_indents").insert(indent).select().single()

      if (error) {
        this.notificationService.error("Failed to create purchase indent")
        throw error
      }

      this.notificationService.success("Purchase indent created successfully")
      return true
    } catch (error) {
      console.error("[v0] Error creating indent:", error)
      return false
    }
  }

  async updateIndent(id: string, indent: Partial<PurchaseIndent>): Promise<boolean> {
    try {
      const { data, error } = await this.supabaseService
        .from("purchase_indents")
        .update(indent)
        .eq("id", id)
        .select()
        .single()

      if (error) {
        this.notificationService.error("Failed to update purchase indent")
        throw error
      }

      this.notificationService.success("Purchase indent updated successfully")
      return true
    } catch (error) {
      console.error("[v0] Error updating indent:", error)
      return false
    }
  }

  async approveIndent(id: string, approved_by: string): Promise<boolean> {
    return this.updateIndent(id, {
      status: "approved",
      approved_by,
      approved_at: new Date().toISOString(),
    })
  }

  async rejectIndent(id: string, rejection_reason?: string): Promise<boolean> {
    return this.updateIndent(id, {
      status: "rejected",
      rejection_reason,
    })
  }
}
