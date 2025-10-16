export type IndentStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface PurchaseIndent {
  id?: string;
  indent_number: string;        // e.g. IND-2025-003
  title?: string | null;
  department: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  required_date: string;        // ISO (yyyy-mm-dd)
  status: IndentStatus;
  total_amount?: number | null;
  notes?: string | null;
  requested_by: string;         // uuid (user)
  approved_by?: string | null;  // uuid
  approved_at?: string | null;  // timestamptz
  rejection_reason?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface IndentItem {
  id?: string;
  indent_id?: string;
  item_id?: string | null;      // inventory id (nullable)
  item_name: string;
  description?: string | null;
  quantity: number;
  unit: string;                 // pcs/kg/ltr...
  estimated_price?: number | null;
  total_price?: number | null;
  created_at?: string;
}

export interface IndentQuery {
  search?: string;
  status?: IndentStatus | 'all';
  priority?: PurchaseIndent['priority'] | 'all';
  page?: number;
  role:any;
  userId:any,
  pageSize?: number;
}
