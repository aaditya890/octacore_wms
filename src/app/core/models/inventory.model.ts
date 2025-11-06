export interface InventoryItem {
  id?: string
  item_code: string
  item_name: string
  description?: string
  category: string
  unit: string
  quantity: number
  min_quantity: number
  max_quantity?: number
  unit_price: number
  location?: string
  supplier?: string
  status: "active" | "inactive" | "discontinued"
  last_restocked?: string
  created_by?: string
  created_at?: string
  updated_at?: string

  // 👇 new flags
  is_repairing?: boolean
  is_other?: boolean
}


export interface InventoryFilter {
  category?: string
  status?: string
  search_term?: string
  min_quantity?: number
  max_quantity?: number
}

export interface InventoryStats {
  total_items: number
  low_stock_items: number
  out_of_stock_items: number
  total_value: number
  active_items: number
  inactive_items: number
}
