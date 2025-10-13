export interface PurchaseIndent {
  id?: string
  indent_number: string
  title: string
  department: string
  priority: "low" | "medium" | "high" | "urgent"
  required_date: string
  status: "draft" | "pending" | "approved" | "rejected" | "completed"
  total_amount?: number
  notes?: string
  requested_by?: string
  approved_by?: string
  approved_at?: string
  rejection_reason?: string
  created_at?: string
  updated_at?: string
}

export interface IndentItem {
  id?: string
  indent_id?: string
  item_id?: string
  item_name: string
  description?: string
  quantity: number
  unit: string
  estimated_price?: number
  total_price?: number
  created_at?: string
}

export interface IndentFilter {
  status?: string
  priority?: string
  department?: string
  search_term?: string
  date_from?: string
  date_to?: string
}

export interface IndentWithItems extends PurchaseIndent {
  items: IndentItem[]
}
