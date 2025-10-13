import { inject, Injectable } from '@angular/core';
import { InventoryFilter, InventoryItem, InventoryStats } from '../../../core/models/inventory.model';
import { SupabaseService } from '../../../core/services/supabase.service';
import { NotificationService } from '../../../core/services/notification.service';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
private supabaseService = inject(SupabaseService)
  private notificationService = inject(NotificationService)

  async getInventoryList(filter?: InventoryFilter): Promise<InventoryItem[]> {
    try {
      let query = this.supabaseService.from("inventory_items").select("*")

      if (filter?.category) {
        query = query.eq("category", filter.category)
      }

      if (filter?.status) {
        query = query.eq("status", filter.status)
      }

      if (filter?.search_term) {
        query = query.or(`item_name.ilike.%${filter.search_term}%,item_code.ilike.%${filter.search_term}%`)
      }

      if (filter?.min_quantity !== undefined) {
        query = query.gte("quantity", filter.min_quantity)
      }

      if (filter?.max_quantity !== undefined) {
        query = query.lte("quantity", filter.max_quantity)
      }

      const { data, error } = await query.order("item_name", { ascending: true })

      if (error) {
        this.notificationService.error("Failed to fetch inventory")
        throw error
      }

      return data || []
    } catch (error) {
      console.error("[v0] Error fetching inventory:", error)
      return []
    }
  }

  async getInventoryById(id: string): Promise<InventoryItem | null> {
    try {
      const { data, error } = await this.supabaseService.from("inventory_items").select("*").eq("id", id).single()

      if (error) {
        this.notificationService.error("Failed to fetch inventory item")
        throw error
      }

      return data
    } catch (error) {
      console.error("[v0] Error fetching inventory item:", error)
      return null
    }
  }

  async addInventory(item: InventoryItem): Promise<boolean> {
    try {
      const { data, error } = await this.supabaseService.from("inventory_items").insert([item]).select()

      if (error) {
        this.notificationService.error("Failed to add inventory item")
        throw error
      }

      this.notificationService.success("Inventory item added successfully")
      return true
    } catch (error) {
      console.error("[v0] Error adding inventory:", error)
      return false
    }
  }

  async updateInventory(id: string, item: Partial<InventoryItem>): Promise<boolean> {
    try {
      const { data, error } = await this.supabaseService.from("inventory_items").update(item).eq("id", id).select()

      if (error) {
        this.notificationService.error("Failed to update inventory item")
        throw error
      }

      this.notificationService.success("Inventory item updated successfully")
      return true
    } catch (error) {
      console.error("[v0] Error updating inventory:", error)
      return false
    }
  }

  async deleteInventory(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabaseService.from("inventory_items").delete().eq("id", id)

      if (error) {
        this.notificationService.error("Failed to delete inventory item")
        throw error
      }

      this.notificationService.success("Inventory item deleted successfully")
      return true
    } catch (error) {
      console.error("[v0] Error deleting inventory:", error)
      return false
    }
  }

  async getInventoryStats(): Promise<InventoryStats> {
    try {
      const items = await this.getInventoryList()

      const stats: InventoryStats = {
        total_items: items.length,
        low_stock_items: items.filter((item) => item.quantity <= item.min_quantity && item.quantity > 0).length,
        out_of_stock_items: items.filter((item) => item.quantity === 0).length,
        total_value: items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0),
        active_items: items.filter((item) => item.status === "active").length,
        inactive_items: items.filter((item) => item.status === "inactive").length,
      }

      return stats
    } catch (error) {
      console.error("[v0] Error calculating inventory stats:", error)
      return {
        total_items: 0,
        low_stock_items: 0,
        out_of_stock_items: 0,
        total_value: 0,
        active_items: 0,
        inactive_items: 0,
      }
    }
  }
}
