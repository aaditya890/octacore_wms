export interface GatePass {
  id?: string
  pass_number: string
  pass_type: "inward" | "outward" | "returnable" | "non-returnable"
  party_name: string
  party_contact?: string
  vehicle_number?: string
  driver_name?: string
  driver_contact?: string
  purpose: string
  expected_return_date?: string
  status: "pending" | "approved" | "rejected" | "completed"
  notes?: string
  created_by?: string
  approved_by?: string
  approved_at?: string
  rejection_reason?: string
  created_at?: string
  updated_at?: string
}

export interface GatePassItem {
  id?: string
  gate_pass_id?: string
  item_id?: string
  item_name: string
  description?: string
  quantity: number
  unit: string
  returned_quantity?: number
  created_at?: string
}

export interface GatePassFilter {
  pass_type?: string
  status?: string
  search_term?: string
  date_from?: string
  date_to?: string
}

export interface GatePassWithItems extends GatePass {
  items: GatePassItem[]
}
