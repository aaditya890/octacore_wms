import { inject, Injectable } from '@angular/core';
import { InventoryService } from '../../inventory/services/inventory.service';
import { InoutService } from '../../inwards-outwards/services/inout.service';
import { IndentService } from '../../purchase-indents/services/indent.service';
import { GatepassService } from '../../gate-pass/services/gatepass.service';

export interface DashboardStats {
  totalInventoryItems: number
  lowStockItems: number
  pendingIndents: number
  pendingGatePasses: number
  todayInward: number
  todayOutward: number
}
@Injectable({
  providedIn: 'root'
})
export class DashboardService {
 private inventoryService = inject(InventoryService)
  private inOutService = inject(InoutService)
  private indentService = inject(IndentService)
  private gatePassService = inject(GatepassService)

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const [inventoryStats, indents, gatePasses, transactions] = await Promise.all([
        this.inventoryService.getInventoryStats(),
        this.indentService.getIndentList({ status: "pending" }),
        this.gatePassService.getGatePassList({ status: "pending" }),
        this.inOutService.getTransactionList({
          dateFrom: new Date(new Date().setHours(0, 0, 0, 0)),
          dateTo: new Date(new Date().setHours(23, 59, 59, 999)),
        }),
      ])

      const todayInward = transactions.filter((t:any) => t.type === "inward").reduce((sum:any, t:any) => sum + t.quantity, 0)
      const todayOutward = transactions.filter((t:any) => t.type === "outward").reduce((sum:any, t:any) => sum + t.quantity, 0)

      return {
        totalInventoryItems: inventoryStats.totalItems,
        lowStockItems: inventoryStats.lowStockItems,
        pendingIndents: indents.length,
        pendingGatePasses: gatePasses.length,
        todayInward,
        todayOutward,
      }
    } catch (error) {
      console.error("[v0] Error fetching dashboard stats:", error)
      return {
        totalInventoryItems: 0,
        lowStockItems: 0,
        pendingIndents: 0,
        pendingGatePasses: 0,
        todayInward: 0,
        todayOutward: 0,
      }
    }
  }
}
