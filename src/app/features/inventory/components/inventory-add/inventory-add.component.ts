import { Component, inject } from '@angular/core';
import { InventoryItem } from '../../../../core/models/inventory.model';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AppRoutes } from '../../../../core/models/app.routes.constant';
import { InventoryService } from '../../services/inventory.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

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
  private inventoryService = inject(InventoryService);

  inventoryForm: FormGroup;
  isLoading = false;
  isEditMode = false;
  itemId: string | null = null;
  
  categories = ["Electronics", "Furniture", "Stationery", "Tools", "Raw Materials", "Finished Goods"];
  units = ["pcs", "kg", "ltr", "box", "carton", "meter"];
  statuses = ["active", "inactive", "discontinued"];
  suppliers = ["Steel Corp", "ABC Supplies", "Prime Traders", "Global Co"];

  readonly AppRoutes = AppRoutes;

  constructor() {
    this.inventoryForm = this.fb.group({
      item_code: ["", [Validators.required, Validators.minLength(3)]],
      item_name: ["", [Validators.required, Validators.minLength(3)]],
      description: [""],
      category: ["", Validators.required],
      unit: ["", Validators.required],
      quantity: [0, [Validators.required, Validators.min(0)]],
      min_quantity: [0, [Validators.required, Validators.min(0)]],
      max_quantity: [1000],
      unit_price: [0, [Validators.required, Validators.min(0)]],
      status: ["active", Validators.required],
      location: [""],
      supplier: [""],
    });
  }

  async ngOnInit() {
    this.itemId = this.route.snapshot.paramMap.get('id');
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
