import { Component, inject } from '@angular/core';
import { AppRoutes } from '../../../../core/models/app.routes.constant';
import { InventoryService } from '../../services/inventory.service';
import { InventoryFilter, InventoryItem } from '../../../../core/models/inventory.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RoleBasedDirective } from '../../../../shared/directives/role-based.directive';
import { HighlightDirective } from '../../../../shared/directives/highlight.directive';
import {MatDialogModule, MatDialog} from '@angular/material/dialog';
import { InventoryDetailComponent } from '../inventory-detail/inventory-detail.component';


@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RoleBasedDirective,MatDialogModule],
  templateUrl: './inventory-list.component.html',
  styleUrl: './inventory-list.component.scss'
})

export class InventoryListComponent {
  selectedItem: InventoryItem | null = null
  isDetailDialogOpen = false;
   private dialog = inject(MatDialog);
  private inventoryService = inject(InventoryService)
  private router = inject(Router)

  inventoryItems: InventoryItem[] = []
  filteredItems: InventoryItem[] = []
  isLoading = false
  searchTerm = ""
  selectedCategory = ""
  selectedStatus = ""

  readonly AppRoutes = AppRoutes

  categories = ["Electronics", "Furniture", "Stationery", "Tools", "Raw Materials", "Finished Goods"]
  statuses = ["active", "inactive", "discontinued"]

  async ngOnInit() {
    await this.loadInventory()
  }

  async loadInventory() {
    this.isLoading = true

    const filter: InventoryFilter = {
      search_term: this.searchTerm || undefined,
      category: this.selectedCategory || undefined,
      status: this.selectedStatus || undefined,
    }

    this.inventoryItems = await this.inventoryService.getInventoryList(filter)
    this.filteredItems = this.inventoryItems
    this.isLoading = false
  }

  onSearch() {
    this.loadInventory()
  }

  onFilterChange() {
    this.loadInventory()
  }

  clearFilters() {
    this.searchTerm = ""
    this.selectedCategory = ""
    this.selectedStatus = ""
    this.loadInventory()
  }

  getStockStatus(item: InventoryItem): string {
    if (item.quantity === 0) return "Out of Stock"
    if (item.quantity <= item.min_quantity) return "Low Stock"
    return "In Stock"
  }

  getStockStatusClass(item: InventoryItem): string {
    if (item.quantity === 0) return "bg-red-100 text-red-800 border-red-500"
    if (item.quantity <= item.min_quantity) return "bg-yellow-100 text-yellow-800 border-yellow-500"
    return "bg-green-100 text-green-800 border-green-500"
  }

  navigateToAdd() {
    this.router.navigate(["/", AppRoutes.INVENTORY, "add"])
  }

  navigateToEdit(id: any) {
    this.router.navigate(["/", AppRoutes.INVENTORY, "edit", id])
  }



  openDetailDialog(item: InventoryItem,index:number) {
  this.dialog.open(InventoryDetailComponent, {
    data: {
      ...item,
      serialNumber: index + 1
    },
    width: '520px',
    panelClass: 'custom-dialog'
  });
  }
  closeDetailDialog() {
    this.isDetailDialogOpen = false
  }

  async deleteItem(id: any, itemName: string) {
    if (confirm(`Are you sure you want to delete "${itemName}"?`)) {
      const success = await this.inventoryService.deleteInventory(id)
      if (success) {
        await this.loadInventory()
      }
    }
  }
}
