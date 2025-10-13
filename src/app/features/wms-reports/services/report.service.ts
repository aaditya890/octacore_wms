import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { NotificationService } from '../../../core/services/notification.service';
export interface Report {
  id?: string
  reportName: string
  reportType: "inventory" | "transactions" | "gatepass" | "indents" | "custom"
  generatedBy: string
  generatedDate: Date
  parameters?: any
  data?: any
  status: "pending" | "completed" | "failed"
  createdAt?: Date
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {

   private supabaseService = inject(SupabaseService)
  private notificationService = inject(NotificationService)

  async getReportList(): Promise<Report[]> {
    try {
      const { data, error } = await this.supabaseService.getReports()

      if (error) {
        this.notificationService.error("Failed to fetch reports")
        throw error
      }

      return data || []
    } catch (error) {
      console.error("[v0] Error fetching reports:", error)
      return []
    }
  }

  async generateReport(report: Report): Promise<boolean> {
    try {
      const { data, error } = await this.supabaseService.from("reports").insert(report).select().single()

      if (error) {
        this.notificationService.error("Failed to generate report")
        throw error
      }

      this.notificationService.success("Report generated successfully")
      return true
    } catch (error) {
      console.error("[v0] Error generating report:", error)
      return false
    }
  }
}
