import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Transaction, TransactionFilter, TransactionSummary } from '../../../core/models/transaction.model';

@Injectable({ providedIn: 'root' })
export class InoutService {
  private supabaseService = inject(SupabaseService);
  private notificationService = inject(NotificationService);

  async getTransactionList(filter?: TransactionFilter): Promise<Transaction[]> {
    try {
      let query = this.supabaseService.from('transactions').select('*');

      if (filter?.transaction_type) query = query.eq('transaction_type', filter.transaction_type);
      if (filter?.item_id) query = query.eq('item_id', filter.item_id);
      if (filter?.date_from) query = query.gte('created_at', filter.date_from);
      if (filter?.date_to) query = query.lte('created_at', filter.date_to);
      if (filter?.search_term)
        query = query.or(`transaction_number.ilike.%${filter.search_term}%,party_name.ilike.%${filter.search_term}%`);

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      this.notificationService.error('Failed to fetch transactions');
      return [];
    }
  }

  async addTransaction(transaction: Transaction): Promise<boolean> {
    try {
      const { data, error } = await this.supabaseService
        .from('transactions')
        .insert(transaction)
        .select()
        .single();

      if (error) throw error;
      this.notificationService.success('Transaction created successfully');
      return true;
    } catch (error) {
      console.error('Error creating transaction:', error);
      this.notificationService.error('Failed to create transaction');
      return false;
    }
  }

  async getTransactionSummary(date_from?: string, date_to?: string): Promise<TransactionSummary> {
    try {
      const transactions = await this.getTransactionList({ date_from, date_to });

      const summary: TransactionSummary = {
        total_inward: transactions.filter(t => t.transaction_type === 'inward').reduce((sum, t) => sum + t.quantity, 0),
        total_outward: transactions.filter(t => t.transaction_type === 'outward').reduce((sum, t) => sum + t.quantity, 0),
        total_adjustments: transactions.filter(t => t.transaction_type === 'adjustment').length,
        total_transfers: transactions.filter(t => t.transaction_type === 'transfer').length,
        period: date_from && date_to ? `${date_from} - ${date_to}` : 'All Time',
      };

      return summary;
    } catch (error) {
      console.error('Error calculating transaction summary:', error);
      return {
        total_inward: 0,
        total_outward: 0,
        total_adjustments: 0,
        total_transfers: 0,
        period: 'Error',
      };
    }
  }

  async syncInventoryStock(transaction: Transaction) {
    try {
      const { item_id, quantity, transaction_type } = transaction;

      if (!item_id || !quantity) return;

      // 1️⃣ Fetch existing item
      const { data: itemData, error: fetchError } = await this.supabaseService
        .from('inventory_items')
        .select('qty')        // 👉 change this to your real column name (e.g. qty or quantity)
        .eq('id', item_id)
        .single();

      if (fetchError) throw fetchError;

      let currentQty = Number(itemData?.qty || 0);

      // 2️⃣ Adjust only once
      let newQty = currentQty;

      if (transaction_type === 'inward') {
        newQty = currentQty + Number(quantity);
      } else if (transaction_type === 'outward') {
        newQty = currentQty - Number(quantity);
      }

      if (newQty < 0) newQty = 0; // prevent negative stock

      // 3️⃣ Update DB
      const { error: updateError } = await this.supabaseService
        .from('inventory_items')
        .update({ qty: newQty })
        .eq('id', item_id);

      if (updateError) throw updateError;

      this.notificationService.success(`Stock updated successfully — New Qty: ${newQty}`);
      console.log(`[Stock Sync] ${transaction_type} done → ${currentQty} → ${newQty}`);
    } catch (error) {
      console.error('[syncInventoryStock] Error syncing inventory stock:', error);
    }
  }

  async getTransactionListPaged(
    pageIndex: number,
    pageSize: number,
    filter: any
  ): Promise<{ data: any[]; total: number }> {
    try {
      let query = this.supabaseService
        .from('transactions')
        .select('*', { count: 'exact' });

      // 🔹 Type filter
      if (filter.transaction_type) {
        query = query.eq('transaction_type', filter.transaction_type);
      }

      // 🔹 Date filter (single day)
      if (filter.selected_date) {
        const startOfDay = `${filter.selected_date}T00:00:00`;
        const endOfDay = `${filter.selected_date}T23:59:59`;
        query = query.gte('created_at', startOfDay).lte('created_at', endOfDay);
      }

      // 🔹 Search filter (works with party name + invoice + notes)
      if (filter.item_name && filter.item_name.trim() !== '') {
        query = query.or(
          `party_name.ilike.%${filter.item_name}%,invoice_number.ilike.%${filter.item_name}%,notes.ilike.%${filter.item_name}%`
        );
      }

      // Pagination
      query = query
        .order('created_at', { ascending: false })
        .range(pageIndex * pageSize, (pageIndex + 1) * pageSize - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return { data: data || [], total: count || 0 };
    } catch (error) {
      console.error('❌ Error fetching paged transactions:', error);
      return { data: [], total: 0 };
    }
  }

  async deleteTransaction(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabaseService
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      this.notificationService.success('Transaction deleted successfully ✅');
      return true;
    } catch (error) {
      console.error('❌ Error deleting transaction:', error);
      this.notificationService.error('Failed to delete transaction ❌');
      return false;
    }
  }

  async getTransactionById(id: string): Promise<any> {
    const { data, error } = await this.supabaseService
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching transaction:', error);
      return null;
    }
    return data;
  }
}
