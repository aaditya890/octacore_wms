import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { IndentItem, IndentQuery, PurchaseIndent } from '../../../core/models/indent.model';

@Injectable({ providedIn: 'root' })
export class IndentService {
  private sb = inject(SupabaseService);
  private T_INDENTS = 'purchase_indents';
  private T_ITEMS = 'indent_items';

  /** IND-YYYY-##### */
  async generateIndentNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const { count } = await this.sb.client
      .from(this.T_INDENTS)
      .select('id', { count: 'exact', head: true })
      .gte('created_at', new Date(year, 0, 1).toISOString())
      .lte('created_at', new Date(year, 11, 31).toISOString());
    const seq = (count ?? 0) + 1;
    const pad = String(seq).padStart(3, '0');
    return `IND-${year}-${pad}`;
  }

  /** Create indent + items; returns saved indent */
  async createIndent(
    payload: Omit<PurchaseIndent, 'id'|'indent_number'|'status'|'total_amount'|'approved_by'|'approved_at'|'rejection_reason'|'created_at'|'updated_at'>
    & { items: IndentItem[] }
  ): Promise<PurchaseIndent> {
    const indent_number = await this.generateIndentNumber();

    // compute totals
    const itemsReady = payload.items.map(it => ({
      indent_id: undefined,
      item_id: it.item_id ?? null,
      item_name: it.item_name,
      description: it.description ?? null,
      quantity: Number(it.quantity),
      unit: it.unit,
      estimated_price: it.estimated_price ?? null,
      total_price: it.estimated_price ? Number(it.quantity) * Number(it.estimated_price) : null
    }));
    const total_amount = itemsReady.reduce((s, it) => s + (it.total_price ?? 0), 0);

    const insertIndent: Partial<PurchaseIndent> = {
      indent_number,
      title: payload['title'] ?? null,
      department: payload.department,
      priority: payload.priority,
      required_date: payload.required_date,
      status: 'pending',
      total_amount,
      notes: payload.notes ?? null,
      requested_by: payload.requested_by
    };

    const { data: created, error } = await this.sb.client
      .from(this.T_INDENTS).insert(insertIndent).select('*').single();
    if (error) throw error;

    const itemsToInsert = itemsReady.map(it => ({ ...it, indent_id: created.id }));
    const { error: itemErr } = await this.sb.client.from(this.T_ITEMS).insert(itemsToInsert);
    if (itemErr) throw itemErr;

    return created as PurchaseIndent;
  }

 async list(q: IndentQuery = { role: 'all', userId: 'all' }) {
  const page = q.page ?? 1, pageSize = q.pageSize ?? 20;
  const from = (page - 1) * pageSize, to = from + pageSize - 1;
  let req = this.sb.client
    .from(this.T_INDENTS)
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (q.search?.trim()) {
    req = req.or(`indent_number.ilike.%${q.search}%,department.ilike.%${q.search}%`);
  }
  if (q.status && q.status !== 'all') req = req.eq('status', q.status);
  if (q.priority && q.priority !== 'all') req = req.eq('priority', q.priority);

  // 🔹 Staff-specific filter
  if (q.role === 'staff' && q.userId) {
    req = req.eq('requested_by', q.userId);
  }

  const { data, count, error } = await req;
  if (error) throw error;
  return { rows: (data as PurchaseIndent[]) ?? [], total: count ?? 0 };
}


  async getWithItems(id: string) {
    const { data: indent, error } = await this.sb.client.from(this.T_INDENTS).select('*').eq('id', id).single();
    if (error) throw error;
    const { data: items, error: e2 } = await this.sb.client.from(this.T_ITEMS).select('*').eq('indent_id', id);
    if (e2) throw e2;
    return { indent: indent as PurchaseIndent, items: (items as IndentItem[]) };
  }

  async approve(id: string, approverId: string) {
    const { error } = await this.sb.client.from(this.T_INDENTS).update({
      status: 'approved',
      approved_by: approverId,
      approved_at: new Date().toISOString(),
      rejection_reason: null
    }).eq('id', id);
    if (error) throw error;
  }

  async reject(id: string, reason: string) {
    const { error } = await this.sb.client.from(this.T_INDENTS).update({
      status: 'rejected',
      rejection_reason: reason,
      approved_by: null,
      approved_at: null
    }).eq('id', id);
    if (error) throw error;
  }

async getIndentById(id: string) {
  // Fetch indent + related items + user details (requested_by, approved_by)
  const { data, error } = await this.sb.client
    .from(this.T_INDENTS)
    .select(`
      *,
      indent_items:indent_items(*),
      requested_user:users!purchase_indents_requested_by_fkey(full_name,email),
      approved_user:users!purchase_indents_approved_by_fkey(full_name,email)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;

  // Map user names for easy display
  const indent = {
    ...data,
    requested_by_name: data.requested_user?.full_name || data.requested_user?.email || '—',
    approved_by_name: data.approved_user?.full_name || data.approved_user?.email || '—',
    indent_items: data.indent_items || []
  };

  return indent;
}



async updateIndentStatus(id: string, status: string, reason?: string, approverId?: string) {
  const payload: any = {
    status,
    updated_at: new Date().toISOString()
  };

  if (status === 'approved') {
    payload.approved_by = approverId;
    payload.approved_at = new Date().toISOString();
  }
  if (status === 'rejected') payload.rejection_reason = reason || null;

  const { error } = await this.sb
    .from('purchase_indents')
    .update(payload)
    .eq('id', id);

  if (error) throw error;
  return true;
}

async deleteIndent(id: string) {
  // First delete items linked with the indent
  const { error: itemErr } = await this.sb.client
    .from(this.T_ITEMS)
    .delete()
    .eq('indent_id', id);
  if (itemErr) throw itemErr;

  // Then delete the indent itself
  const { error: indentErr } = await this.sb.client
    .from(this.T_INDENTS)
    .delete()
    .eq('id', id);
  if (indentErr) throw indentErr;

  return true;
}


}
