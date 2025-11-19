import { Component, inject } from '@angular/core';
import { AppRoutes } from '../../../../core/models/app.routes.constant';
import { InventoryService } from '../../services/inventory.service';
import { InventoryFilter, InventoryItem } from '../../../../core/models/inventory.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RoleBasedDirective } from '../../../../shared/directives/role-based.directive';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { InventoryDetailComponent } from '../inventory-detail/inventory-detail.component';
import { NotificationService } from '../../../../core/services/notification.service';
import { SettingsService } from '../../../wms-settings/services/settings.service';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RoleBasedDirective, MatDialogModule],
  templateUrl: './inventory-list.component.html',
  styleUrl: './inventory-list.component.scss'
})
export class InventoryListComponent {
  private dialog = inject(MatDialog);
  private settingsService = inject(SettingsService);  
  private inventoryService = inject(InventoryService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  inventoryItems: InventoryItem[] = [];
  filteredItems: InventoryItem[] = [];
  isLoading = false;
  searchTerm = '';
  selectedCategory = '';
  selectedStatus = '';
  selectedType = '';

  readonly AppRoutes = AppRoutes;

  categories:string[] = [];
  statuses:string[] = ['active', 'inactive', 'discontinued'];

  async ngOnInit() {
    this.categories = await this.settingsService.get('category');
    await this.loadInventory();
  }

  async loadInventory() {
    this.isLoading = true;

    const filter: InventoryFilter = {
      search_term: this.searchTerm || undefined,
      category: this.selectedCategory || undefined,
      status: this.selectedStatus || undefined
    };

    this.inventoryItems = await this.inventoryService.getInventoryList(filter);

    // ✅ Filter by type: repairing / other
    this.filteredItems = this.inventoryItems.filter((item) => {
      if (this.selectedType === 'repairing') return item.is_repairing;
      if (this.selectedType === 'other') return item.is_other;
      if (this.selectedType === 'normal') return !item.is_other && !item.is_repairing;
      return true;
    });

    this.isLoading = false;
  }

  onSearch() {
    this.loadInventory();
  }

  onFilterChange() {
    this.loadInventory();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedStatus = '';
    this.selectedType = '';
    this.loadInventory();
  }

  getStockStatus(item: InventoryItem): string {
    if (item.quantity === 0) return 'Out of Stock';
    if (item.quantity <= item.min_quantity) return 'Low Stock';
    return 'In Stock';
  }

  navigateToAdd() {
    this.router.navigate(['/', AppRoutes.INVENTORY, 'add']);
  }

  navigateToEdit(id: any) {
    this.router.navigate(['/', AppRoutes.INVENTORY, 'edit', id]);
  }

  openDetailDialog(item: InventoryItem, index: number) {
    this.dialog.open(InventoryDetailComponent, {
      data: { ...item, serialNumber: index + 1 },
      width: '520px',
      panelClass: 'custom-dialog'
    });
  }

  async deleteItem(id: any, itemName: string) {
    if (confirm(`Are you sure you want to delete "${itemName}"?`)) {
      const success = await this.inventoryService.deleteInventory(id);
      if (success) {
        await this.loadInventory();
      }
    }
  }

async markAsRepaired(item: any, id: any) {
  console.log("🧩 Repair clicked for:", item);
  try {
    // 1️⃣ Fetch all inventory items fresh
    const allItems = await this.inventoryService.getInventoryList();

    // 2️⃣ Find main (non-repairing) item with same name
    const mainItem: any = allItems.find(
      (i) =>
        i.item_name.trim().toLowerCase() === item.item_name.trim().toLowerCase() &&
        !i.is_repairing
    );

    if (mainItem) {
      // ✅ Case 1: main item exists → merge qty + delete repairing
      const updatedQty = (Number(mainItem.quantity) || 0) + (Number(item.quantity) || 0);

      const updateMain = await this.inventoryService.updateInventory(mainItem.id, {
        quantity: updatedQty,
        updated_at: new Date().toISOString(),
      });

      const deleteRepair = await this.inventoryService.deleteInventory(id);

      if (updateMain && deleteRepair) {
        this.notificationService.success(
          `"${item.item_name}" repaired ✅ — merged with main item`
        );
        await this.loadInventory();
      } else {
        this.notificationService.error("❌ Failed to merge repairing item");
      }
    } else {
      // ✅ Case 2: no main item found → mark this item as normal (repair complete)
      const updated = await this.inventoryService.updateInventory(id, {
        is_repairing: false,
        updated_at: new Date().toISOString(),
      });

      if (updated) {
        this.notificationService.success(
          `"${item.item_name}" marked as repaired and converted to main item ✅`
        );
        await this.loadInventory();
      } else {
        this.notificationService.error("❌ Failed to update repairing item");
      }
    }
  } catch (error) {
    console.error("⚠️ Error in markAsRepaired:", error);
    this.notificationService.error("Something went wrong ❌");
  }
}




}
