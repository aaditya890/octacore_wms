import { Component, inject } from '@angular/core';
import { InventoryItem } from '../../../../core/models/inventory.model';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AppRoutes } from '../../../../core/models/app.routes.constant';
import { InventoryService } from '../../services/inventory.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../../../wms-settings/services/settings.service';

@Component({
  selector: 'app-inventory-add',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './inventory-add.component.html',
  styleUrl: './inventory-add.component.scss'
})
export class InventoryAddComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private settingsService = inject(SettingsService);
  private inventoryService = inject(InventoryService);

  inventoryForm: FormGroup;
  isLoading = false;
  isEditMode = false;
  itemId: string | null = null;
  
  categories: string[] = [];
  units: string[] = [];
  statuses = ["active", "inactive", "discontinued"];
  suppliers: string[] = [];

  readonly AppRoutes = AppRoutes;

  constructor() {
    this.inventoryForm = this.fb.group({
      // 🔹 Removed item_code
      item_name: ["", [Validators.required, Validators.minLength(3)]],
      description: [""],
      category: ["", Validators.required],
      unit: ["", Validators.required],
      quantity: [0, [Validators.required, Validators.min(0)]],
      // 🔹 Removed min_quantity & max_quantity
      unit_price: [0, [Validators.required, Validators.min(0)]],
      status: ["active", Validators.required],
      location: [""],
      supplier: [""],
    });
  }

  async ngOnInit() {
    this.itemId = this.route.snapshot.paramMap.get('id');
    this.categories = await this.settingsService.get('category');
  this.units = await this.settingsService.get('unit');
  this.suppliers = await this.settingsService.get('supplier');
    if (this.itemId) {
      this.isEditMode = true;
      await this.loadItem();
    }
  }

  async loadItem() {
    this.isLoading = true;
    const item = await this.inventoryService.getInventoryById(this.itemId!);
    this.isLoading = false;
    if (item) this.inventoryForm.patchValue(item);
  }

  async onSubmit() {
    if (this.inventoryForm.invalid) {
      this.inventoryForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formValue = this.inventoryForm.value;
    let success = false;

    if (this.isEditMode && this.itemId) {
      const updateData = { ...formValue, updated_at: new Date().toISOString() };
      success = await this.inventoryService.updateInventory(this.itemId, updateData);
    } else {
      const newItem: InventoryItem = {
        ...formValue,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      success = await this.inventoryService.addInventory(newItem);
    }

    this.isLoading = false;
    if (success) this.router.navigate(['/', this.AppRoutes.INVENTORY]);
  }

  onCancel() {
    this.router.navigate(['/', this.AppRoutes.INVENTORY]);
  }
}
