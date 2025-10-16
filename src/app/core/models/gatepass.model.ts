export type GatePassStatus = 'pending' | 'approved' | 'rejected' | 'completed';
export type GatePassType   = 'material' | 'visitor' | 'vehicle' | 'returnable';

export interface GatePass {
  id?: string;
  pass_number?: string;
  pass_type: GatePassType;
  party_name: string;
  party_contact?: string;
  vehicle_number?: string;
  purpose: string;
  valid_from: string;
  valid_to: string;
  status?: GatePassStatus;
  notes?: string;
  created_by?: string;
  created_at?: string;
}

export interface GatePassItem {
  id?: string;
  gate_pass_id: string;
  item_id?: string;
  item_name: string;
  description?: string;
  quantity: number;
  unit: string;
  returned_quantity?: number;
  created_at?: string;
}

export interface GatePassWithItems extends GatePass {
  items: GatePassItem[];
}
