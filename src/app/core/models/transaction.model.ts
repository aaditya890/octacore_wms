export interface Transaction {
  id?: string;
  transaction_number: string;
  transaction_type: "inward" | "outward" | "adjustment" | "transfer";
  item_id?: any; // can be null for manual entries
  quantity: number;
  unit_price?: number;
  total_amount?: number;
  reference_type?: "gate_pass" | "indent" | "manual";
  reference_id?: string;
  from_location?: string | null;
  to_location?: string;
  party_name?: string;
  invoice_number?: string;
  notes?: string;
  created_by?: any;
  created_at?: any;
  is_repairing?: boolean;
  is_other?: boolean;
  item_display_name?:any,
  expected_return_date?: string | null | Date;
}



export interface TransactionFilter {
  transaction_type?: string;
  item_id?: string;
  reference_type?: string;
  search_term?: string;
  date_from?: string;
  date_to?: string;
}

export interface TransactionSummary {
  total_inward: number;
  total_outward: number;
  total_adjustments: number;
  total_transfers: number;
  period: string;
}
