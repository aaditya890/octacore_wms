import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { InventoryService } from '../../../inventory/services/inventory.service';
import { AppRoutes } from '../../../../core/models/app.routes.constant';
import { InventoryItem } from '../../../../core/models/inventory.model';
import { AuthService } from '../../../../core/services/auth.service';  // ✅ added
import { InoutService } from '../../../inwards-outwards/services/inout.service';

interface DashboardStats {
  totalItems: number;
  lowStockItems: number;
  pendingIndents: number;
  todayTransactions: number;
  pendingGatePass: number;
  totalInwards: number;
  totalOutwards: number;
  totalValue: number;
}

interface QuickAction {
  title: string;
  icon: string;
  route: string[];
  color: string;
  bgColor: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  private inventoryService = inject(InventoryService);
  private inoutService = inject(InoutService);  // 🔹 injected
  private router = inject(Router);
  private authService = inject(AuthService); // ✅ added
  recentTransactions: any[] = [];

  readonly AppRoutes = AppRoutes;
  stats: DashboardStats = {
    totalItems: 0,
    lowStockItems: 0,
    totalInwards: 0,
    totalOutwards: 0,
    totalValue: 0,
    pendingIndents: 0,
    pendingGatePass: 0,
    todayTransactions: 0,
  };

  lowStockItems: InventoryItem[] = [];
  isLoading = true;

  currentUser = {
    name: '',
    role: '',
  };

  quickActions: QuickAction[] = [
    {
      title: 'Add Item',
      icon: 'M12 4v16m8-8H4',
      route: ['/', AppRoutes.INVENTORY, 'add'],
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Inward Entry',
      icon: 'M7 16V4m0 0L3 8m4-4l4 4',
      route: ['/', AppRoutes.INOUT, AppRoutes.INWARDS],
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Create Indent',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      route: ['/', AppRoutes.PURCHASE_INDENTS],
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Gate Pass',
      icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
      route: ['/', AppRoutes.GATE_PASS],
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  async ngOnInit() {
    this.loadCurrentUser(); // ✅ load user first
    await this.loadDashboardData();
  }

  // ✅ Get current user details from AuthService
  loadCurrentUser() {
    const user = this.authService.currentUser(); // If signal, then this.authService.currentUser()
    if (user) {
      this.currentUser.name = user.full_name || 'User';
      this.currentUser.role = user.role || 'Viewer';
    } else {
      this.currentUser.name = 'Guest';
      this.currentUser.role = 'Viewer';
    }
  }

  async loadDashboardData() {
    this.isLoading = true;
    try {
      const allItems = await this.inventoryService.getInventoryList({});
      const transactions = await this.inoutService.getTransactionListPaged(0, 100, {}); // get last 100 transactions

      // 🔹 Parse numbers properly
      allItems.forEach((item: any) => {
        item.quantity = Number(item.quantity) || 0;
        item.min_quantity = Number(item.min_quantity) || 0;
        item.unit_price = Number(item.unit_price) || 0;
      });

      // 🔸 1. Total items in warehouse
      this.stats.totalItems = allItems.length;

      // 🔸 2. Out of stock / low stock
      const lowStock = allItems.filter((i: any) => i.quantity <= i.min_quantity);
      this.stats.lowStockItems = lowStock.length;
      this.lowStockItems = lowStock.slice(0, 5);

      // 🔸 3. Calculate values for Inward / Outward transactions
      let totalInwardValue = 0;
      let totalOutwardValue = 0;
      let todayValue = 0;

      const today = new Date().toISOString().split('T')[0];

      for (const t of transactions.data || []) {
        const qty = Number(t.quantity) || 0;
        const price = Number(t.unit_price) || 0;
        const value = qty * price;
        const date = t.created_at?.split('T')[0];

        if (t.transaction_type === 'inward') totalInwardValue += value;
        if (t.transaction_type === 'outward') totalOutwardValue += value;

        if (date === today) todayValue += value;
      }

      this.stats.totalInwards = totalInwardValue;
      this.stats.totalOutwards = totalOutwardValue;
      this.stats.todayTransactions = todayValue;
      this.stats.pendingIndents = 0;
      this.stats.pendingGatePass = 0;


      // 🔸 4. Current total warehouse stock value
      this.stats.totalValue = allItems.reduce(
        (sum, i) => sum + i.quantity * i.unit_price,
        0
      );

      // 🔸 5. Dummy placeholders
      this.stats.pendingIndents = 0;

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      this.isLoading = false;
    }
  }


  navigateTo(route: string[]) {
    this.router.navigate(route);
  }


}
