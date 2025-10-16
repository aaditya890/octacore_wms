import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { NotificationService } from '../../../core/services/notification.service';
import { GatePass, GatePassItem } from '../../../core/models/gatepass.model';


@Injectable({ providedIn: 'root' })
export class GatepassService {
  private sb = inject(SupabaseService);
  private notify = inject(NotificationService);

  // Auto generate pass number like GP-2025-0001
  private async generatePassNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const { count, error } = await this.sb.client
      .from('gate_passes')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    const newNumber = (count || 0) + 1;
    return `GP-${year}-${String(newNumber).padStart(4, '0')}`;
  }

  // Create gate pass with optional items
  async createGatePass(gatePass: GatePass, items: GatePassItem[] = []) {
    try {
      const pass_number = await this.generatePassNumber();

      const { data: user } = await this.sb.client.auth.getUser();
      const created_by = user?.user?.id ?? null;

      const payload: GatePass = {
        ...gatePass,
        pass_number,
        status: 'pending',
        created_by: created_by ?? undefined,
      };

      const { data: inserted, error } = await this.sb.client
        .from('gate_passes')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      if (items.length) {
        const mapped = items.map((i) => ({
          ...i,
          gate_pass_id: inserted.id,
          returned_quantity: i.returned_quantity ?? 0,
        }));
        const { error: itemError } = await this.sb.client
          .from('gate_pass_items')
          .insert(mapped);
        if (itemError) throw itemError;
      }

      this.notify.success(`Gate Pass created: ${inserted.pass_number}`);
      return inserted;
    } catch (err: any) {
      this.notify.error(err.message || 'Error creating gate pass');
      console.error('createGatePass error:', err);
      return null;
    }
  }
}
