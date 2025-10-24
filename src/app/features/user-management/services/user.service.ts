import { inject, Injectable } from '@angular/core';
import { User, UserFilter } from '../../../core/models/user.model';
import { SupabaseService } from '../../../core/services/supabase.service';
import { NotificationService } from '../../../core/services/notification.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private supabaseService = inject(SupabaseService);
  private notificationService = inject(NotificationService);

  /** 🔹 Fetch user list with optional filters */
  async getUserList(filter?: UserFilter): Promise<User[]> {
    try {
      let query = this.supabaseService.from('users').select('*');

      // 🔸 Filter by role
      if (filter?.role) {
        query = query.eq('role', filter.role);
      }

      // 🔸 Filter by department
      if (filter?.department) {
        query = query.eq('department', filter.department);
      }

      // 🔸 Filter by is_active (status)
      if ((filter as any)?.is_active !== undefined) {
        query = query.eq('is_active', (filter as any).is_active);
      }
// new ✅
if (filter?.search_term) {
  query = query.or(
    `full_name.ilike.%${filter.search_term}%,email.ilike.%${filter.search_term}%`
  );
}

      const { data, error } = await query.order('full_name', { ascending: true });

      if (error) {
        this.notificationService.error('Failed to fetch users');
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('[UserService] Error fetching users:', error);
      return [];
    }
  }

  /** 🔹 Fetch single user by ID */
  async getUserById(id: string): Promise<User | null> {
    try {
      const { data, error } = await this.supabaseService
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        this.notificationService.error('Failed to fetch user');
        throw error;
      }

      return data;
    } catch (error) {
      console.error('[UserService] Error fetching user:', error);
      return null;
    }
  }

  /** 🔹 Update user details */
  async updateUser(id: string, user: Partial<User>): Promise<boolean> {
    try {
      const { error } = await this.supabaseService
        .from('users')
        .update(user)
        .eq('id', id);

      if (error) {
        this.notificationService.error('Failed to update user');
        throw error;
      }

      this.notificationService.success('User updated successfully');
      return true;
    } catch (error) {
      console.error('[UserService] Error updating user:', error);
      return false;
    }
  }

async syncUserWithAuth(): Promise<User | null> {
  try {
    const { data: { user }, error: authError } = await this.supabaseService.client.auth.getUser();
    if (authError || !user) return null;

    const meta = user.user_metadata || {};
    const userData = {
      id: user.id, // Supabase Auth ID as primary key
      email: user.email,
      full_name: meta["full_name"] || user.email?.split("@")[0] || "User",
      role: meta["role"],
      department: meta["department"] || null,
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    // 🟢 Upsert into 'users' table (insert if not exists)
    const { data, error } = await this.supabaseService.client
      .from("users")
      .upsert(userData, { onConflict: "id" })
      .select("*")
      .single();

    if (error) {
      console.error("[UserService] Upsert error:", error);
      return null;
    }

    console.log("✅ User synced successfully:", data);
    return data as User;
  } catch (err) {
    console.error("[UserService] Sync error:", err);
    return null;
  }
}


}
