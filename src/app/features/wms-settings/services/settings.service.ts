import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { NotificationService } from '../../../core/services/notification.service';

export interface Settings {
  id?: string
  companyName: string
  companyAddress?: string
  companyPhone?: string
  companyEmail?: string
  currency: string
  dateFormat: string
  timezone: string
  lowStockThreshold: number
  enableNotifications: boolean
  enableEmailAlerts: boolean
  updatedAt?: Date
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

   private supabase = inject(SupabaseService);
  private notify = inject(NotificationService);

  // FETCH MASTER LIST => category / unit / supplier
  async get(type: string): Promise<string[]> {
    const { data, error } = await this.supabase.client
      .from('settings')
      .select('id, key')
      .eq('category', type)
      .order('key', { ascending: true });

    if (error) {
      console.log("GET ERROR:", error);
      return [];
    }

    return data.map(item => item.key);
  }

  // ADD MASTER ITEM
  async add(type: string, value: string): Promise<boolean> {
    value = value?.trim();
    if (!value) return false;

    const { error } = await this.supabase.client
      .from('settings')
      .insert([
        {
          key: value,
          category: type,
          value: {}, // jsonb
          updated_at: new Date().toISOString()
        }
      ]);

    if (error) {
      console.log("ADD ERROR:", error);
      this.notify.error("Failed to add");
      return false;
    }

    this.notify.success("Added Successfully");
    return true;
  }

  // OPTIONAL DELETE FEATURE
  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase.client
      .from('settings')
      .delete()
      .eq('id', id);

    if (error) {
      console.log("DELETE ERROR:", error);
      this.notify.error("Failed to delete");
      return false;
    }

    this.notify.success("Deleted Successfully");
    return true;
  }

  async getId(type: string, value: string) {
  const { data } = await this.supabase.client
    .from('settings')
    .select('id')
    .eq('category', type)
    .eq('key', value)
    .single();

  return data?.id || null;
}

}
