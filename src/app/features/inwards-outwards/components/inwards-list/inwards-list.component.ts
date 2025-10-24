import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { InventoryService } from '../../../inventory/services/inventory.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { InoutService } from '../../services/inout.service';
import { Transaction } from '../../../../core/models/transaction.model';
import { AppRoutes } from '../../../../core/models/app.routes.constant';

@Component({
  selector: 'app-inwards-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './inwards-list.component.html',
  styleUrls: ['./inwards-list.component.scss'],
})
export class InwardsListComponent {
  private inventoryService = inject(InventoryService);
  private authService = inject(AuthService);
  private inoutService = inject(InoutService);
  private notification = inject(NotificationService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  items: any[] = [];
  unitOptions = ['pcs', 'kg', 'ltr', 'box', 'carton', 'meter'];
  categories = ['Electronics', 'Furniture', 'Stationery', 'Tools', 'Raw Materials', 'Finished Goods'];
  suppliers = ['Steel Corp', 'ABC Supplies', 'Prime Traders', 'Global Co'];
  currentUser: any;
  isNewItem = false;
  inwardForm!: FormGroup;
  filteredItems: any[] = [];
  selectedItemName = '';

  constructor() {
    this.initForm();
  }

  async ngOnInit() {
    this.currentUser = this.authService.currentUser();
    await this.loadItems();
    console.log(this.items);

  }

  initForm() {
    this.inwardForm = this.fb.group({
      item_id: [null],
      quantity: [null, [Validators.required, Validators.min(1)]],
      unit: ['', Validators.required],
      unit_price: [0],
      party_name: ['', Validators.required],
      invoice_number: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9 ]+$/)]],
      transaction_date: [new Date().toISOString().split('T')[0]],
      notes: [''],
      add_to_inventory: [false],
      is_repairing: [false],
      is_other: [false],
      inv_item_name: [''],
      inv_category: [''],
      inv_supplier: [''],
      inv_description: [''],
       // 👇 new fields
  repairing_item_name: [''],
  other_item_name: [''],
    });
  }

  async loadItems() {
    try {
      this.items = await this.inventoryService.getInventoryList({});
    } catch {
      this.items = [];
    }
  }

  onItemInput(event: any) {
    const value = event.target.value.toLowerCase();
    this.filteredItems = this.items.filter((i) =>
      i.item_name.toLowerCase().includes(value)
    );
  }

  selectItem(item: any) {
    this.filteredItems = [];
    this.selectedItemName = item.item_name;
    this.inwardForm.patchValue({
      item_id: item.id,
      unit: item.unit,
      unit_price: item.unit_price,
      notes: `Category: ${item.category}, Current Qty: ${item.quantity}`,
    });
  }

async saveInwardEntry() {
  if (this.inwardForm.invalid) {
    this.notification.error('Please fill all required fields.');
    return;
  }

  const f = this.inwardForm.value;
  const total = (f.quantity || 0) * (f.unit_price || 0);

  let itemName = '-';
  let newItemId: string | null = null;

  // ✅ Determine item name based on selection type
  if (f.is_repairing) {
    itemName = f.repairing_item_name?.trim() || '-';
  } else if (f.is_other) {
    itemName = f.other_item_name?.trim() || '-';
  } else if (f.add_to_inventory) {
    itemName = f.inv_item_name?.trim() || '-';
  } else {
    itemName = this.selectedItemName || f.inv_item_name || '-';
  }

  const remarks = f.notes?.trim() || '';

  // ✅ If "Add to Inventory" is checked, create new inventory item first
  if (f.add_to_inventory && !f.is_repairing && !f.is_other) {
    const newItem: any = {
      id: crypto.randomUUID(),
      item_code: 'AUTO-' + Date.now(),
      item_name: itemName || 'Unnamed Item',
      description: f.inv_description || remarks || '',
      category: f.inv_category || 'Uncategorized',
      unit: f.unit,
      quantity: f.quantity,
      min_quantity: 0,
      max_quantity: null,
      unit_price: f.unit_price || 0,
      location: 'Main Warehouse',
      supplier: f.inv_supplier || f.party_name || '',
      status: 'active',
      last_restocked: new Date().toISOString(),
      created_by: this.currentUser?.id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await this.inventoryService.addInventory(newItem);
    console.log('✅ Added new item to inventory:', newItem.item_name);
    newItemId = newItem.id;
  }

  // ✅ Create clean transaction object
  const newTransaction: Transaction = {
    transaction_number: `IN-${Date.now()}`,
    transaction_type: 'inward',
    item_id: newItemId || (this.isNewItem ? null : f.item_id),
    quantity: f.quantity,
    unit_price: f.unit_price,
    total_amount: total,
    reference_type: 'manual',
    from_location: null,
    to_location: 'Main Warehouse',
    party_name: f.party_name,
    invoice_number: f.invoice_number,

    // 🧠 Store cleanly
    notes: remarks,               // only remarks here
    item_display_name: itemName,  // custom field for item name

    is_repairing: f.is_repairing || false,
    is_other: f.is_other || false,
    created_by: this.currentUser?.id || null,
    created_at: new Date().toISOString(),
  };

  // ✅ Save transaction
  const success = await this.inoutService.addTransaction(newTransaction);

  if (success) {
    // ✅ Sync stock for existing items only
    if (!f.add_to_inventory && !this.isNewItem && newTransaction.item_id) {
      await this.inoutService.syncInventoryStock(newTransaction);
    }

    this.notification.success('Inward entry saved successfully ✅');
    this.router.navigate(['/', AppRoutes.INOUT]);
  }
}


}
