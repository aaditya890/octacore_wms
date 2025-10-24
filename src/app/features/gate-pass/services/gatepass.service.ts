import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { NotificationService } from '../../../core/services/notification.service';
import { GatePass, GatePassItem } from '../../../core/models/gatepass.model';


@Injectable({ providedIn: 'root' })
export class GatepassService {
  private sb = inject(SupabaseService);
  private notify = inject(NotificationService);

  // fetch all (admin)
  async getAllGatePasses() {
    try {
      const { data, error } = await this.sb.client
        .from('gate_passes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (err) {
      this.notify.error('Failed to load gate passes');
      console.error('getAllGatePasses error:', err);
      return [];
    }
  }

  async getGatePassesByUser(userId: string) {
    try {
      const { data, error } = await this.sb.client
        .from('gate_passes')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('getGatePassesByUser error:', err);
      this.notify.error('Failed to load your passes');
      return [];
    }
  }

  // approve / reject
  async updateStatus(passId: string, status: 'approved' | 'rejected') {
    try {
      const { error } = await this.sb.client
        .from('gate_passes')
        .update({ status })
        .eq('id', passId);

      if (error) throw error;
      this.notify.success(`Gate pass ${status}`);
      return true;
    } catch (err) {
      console.error('updateStatus error:', err);
      this.notify.error('Action failed');
      return false;
    }
  }

  // delete
  async deleteGatePass(passId: string) {
    try {
      const { error } = await this.sb.client
        .from('gate_passes')
        .delete()
        .eq('id', passId);

      if (error) throw error;
      this.notify.success('Gate pass deleted');
      return true;
    } catch (err) {
      console.error('deleteGatePass error:', err);
      this.notify.error('Failed to delete');
      return false;
    }
  }

  // fetch by pass_number (verify + receipt)
  async findByPassNumber(passNumber: string) {
    try {
      const { data, error } = await this.sb.client
        .from('gate_passes')
        .select(`*, gate_pass_items(*)`)
        .eq('pass_number', passNumber)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('findByPassNumber error:', err);
      return null;
    }
  }

  // 👇 ye function createGatePass() ke upar daal de
  private async generatePassNumber(): Promise<string> {
    const year = new Date().getFullYear();

    const { data, error } = await this.sb.client
      .from('gate_passes')
      .select('pass_number')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) console.error(error);

    let lastNum = 0;
    if (data?.pass_number) {
      const parts = data.pass_number.split('-');
      lastNum = parseInt(parts[2], 10) || 0;
    }
    const newNum = lastNum + 1;
    return `GP-${year}-${String(newNum).padStart(4, '0')}`;
  }

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
