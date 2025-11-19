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
import { SettingsService } from '../../../wms-settings/services/settings.service';

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
  private settingsService = inject(SettingsService);
  private inoutService = inject(InoutService);
  private notification = inject(NotificationService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  items: any[] = [];
  filteredItems: any[] = [];
  selectedItem: any = null;
  currentUser: any;
  unitOptions:string[] = [];
  categories:string[] = [];
  suppliers:string[] = [];
  inwardForm!: FormGroup;

  constructor() {
    this.initForm();
  }

  async ngOnInit() {
    this.unitOptions = await this.settingsService.get('unit');
    this.categories = await this.settingsService.get('category');
    this.suppliers = await this.settingsService.get('supplier');
    this.currentUser = this.authService.currentUser();
    await this.loadItems();
  }

  initForm() {
    this.inwardForm = this.fb.group({
      // ✅ Mode selection
      use_existing_item: [false],
      add_to_inventory: [false],
      is_repairing: [false],
      is_other: [false],

      // ✅ Common fields
      item_id: [null],
      inv_item_name: [''],
      repairing_item_name: [''],
      other_item_name: [''],
      inv_category: [''],
      inv_supplier: [''],
      inv_description: [''],

      // ✅ Transaction details
      quantity: [null, [Validators.required, Validators.min(1)]],
      unit: ['', Validators.required],
      unit_price: [0],
      party_name: ['', Validators.required],
      invoice_number: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9 ]+$/)]],
      transaction_date: [new Date().toISOString().split('T')[0]],
      notes: ['']
    });
  }

  async loadItems() {
    try {
      this.items = await this.inventoryService.getInventoryList({});
    } catch {
      this.items = [];
    }
  }

  // 🔹 Autocomplete filter
  onItemInput(event: any) {
    const value = event.target.value.toLowerCase();
    this.filteredItems = this.items.filter((i) =>
      i.item_name.toLowerCase().includes(value)
    );
  }

  selectItem(item: any) {
    this.filteredItems = [];
    this.selectedItem = item;

    this.inwardForm.patchValue({
      item_id: item.id,
      inv_item_name: item.item_name,
      unit: item.unit,
      unit_price: item.unit_price,
      inv_category: item.category,
      inv_supplier: item.supplier,
      notes: `Existing item - Current Qty: ${item.quantity}`,
      party_name: item.supplier || ''
    });
  }
// ✅ FINAL FIXED VERSION — with Repairing Clone + Safe Update
async saveInwardEntry() {
  if (this.inwardForm.invalid) {
    this.notification.error('Please fill all required fields.');
    return;
  }

  const f = this.inwardForm.value;
  const total = (f.quantity || 0) * (f.unit_price || 0);
  let newItemId: string | null = null;

  // ✅ CASE 1: Existing inventory item
  if (f.use_existing_item && f.item_id) {
    newItemId = f.item_id;
  }

  // ✅ CASE 2: Add New / Repairing / Other → insert new record in inventory
  // but NOT when using existing item (avoid flagging main item)
  if ((f.add_to_inventory || f.is_repairing || f.is_other) && !f.use_existing_item) {
    let itemStatus = 'active'; // always valid for DB constraint

    // ✅ Ensure name always comes correctly
    const invItemName =
      (f.inv_item_name || '').trim() ||
      (f.repairing_item_name || '').trim() ||
      (f.other_item_name || '').trim() ||
      'Unnamed Item';

    // ✅ Ensure supplier is not blank
    const supplierName =
      (f.inv_supplier || '').trim() ||
      (f.party_name || '').trim() ||
      'Unknown Supplier';

    // ✅ Create object safely
    const newItem: any = {
      id: crypto.randomUUID(),
      item_code: 'AUTO-' + Date.now(),
      item_name: invItemName,
      description: f.inv_description || f.notes || '',
      category:
        f.inv_category ||
        (f.is_repairing ? 'Repairing' : f.is_other ? 'Misc' : 'Uncategorized'),
      unit: f.unit,
      quantity: Number(f.quantity) || 0,
      min_quantity: 0,
      max_quantity: null,
      unit_price: Number(f.unit_price) || 0,
      location: 'Main Warehouse',
      supplier: supplierName,
      status: itemStatus,
      last_restocked: new Date().toISOString(),
      created_by: this.currentUser?.id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_repairing: !!f.is_repairing,
      is_other: !!f.is_other
    };

    // ✅ Insert and get ID
    try {
      const added = await this.inventoryService.addInventoryAndReturn(newItem);
      if (added?.id) {
        newItemId = added.id;
      } else {
        throw new Error('Insert failed');
      }
    } catch (err) {
      console.error('[Inventory] Error adding new inventory item:', err);
      this.notification.error('Failed to add new item ❌');
      return;
    }
  }

  // ✅ CASE 3: If user selected existing + repairing → clone to new repairing item
  if (f.use_existing_item && f.is_repairing && this.selectedItem) {
    const base = this.selectedItem;

    const repairingItem: any = {
      id: crypto.randomUUID(),
      item_code: 'REP-' + Date.now(),
      item_name: base.item_name,
      description: base.description || '',
      category: base.category || 'Repairing',
      unit: base.unit,
      quantity: Number(f.quantity) || 0,
      unit_price: base.unit_price,
      supplier: base.supplier,
      status: 'active',
      location: base.location || 'Main Warehouse',
      is_repairing: true, // ✅ only this one is repairing
      is_other: false,
      last_restocked: new Date().toISOString(),
      created_by: this.currentUser?.id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const added = await this.inventoryService.addInventoryAndReturn(repairingItem);
      if (added?.id) {
        newItemId = added.id;
      } else {
        throw new Error('Failed to create repairing item');
      }
    } catch (err) {
      console.error('[Inventory] Repairing add failed:', err);
      this.notification.error('Failed to add repairing item ❌');
      return;
    }
  }

  // ✅ Fallback for missing supplier when using existing item
  if (f.use_existing_item && !f.party_name) {
    const existing = this.items.find((x) => x.id === f.item_id);
    f.party_name = existing?.supplier || 'Unknown Supplier';
  }

  // ✅ TRANSACTION ENTRY
  const newTransaction: Transaction = {
    transaction_number: `IN-${Date.now()}`,
    transaction_type: 'inward',
    item_id: newItemId,
    quantity: Number(f.quantity) || 0,
    unit_price: Number(f.unit_price) || 0,
    total_amount: total,
    reference_type: 'manual',
    from_location: null,
    to_location: 'Main Warehouse',
    party_name: f.party_name,
    invoice_number: f.invoice_number,
    notes: f.notes || '',
    item_display_name:
      f.inv_item_name || f.repairing_item_name || f.other_item_name || '',
    is_repairing: !!f.is_repairing,
    is_other: !!f.is_other,
    created_by: this.currentUser?.id || null,
    created_at: new Date().toISOString()
  };

  const success = await this.inoutService.addTransaction(newTransaction);

  // ✅ Update stock only if not marking repairing
  if (success && f.use_existing_item && !f.is_repairing) {
    await this.inoutService.syncInventoryStock(newTransaction);
  }

  if (success) {
    this.notification.success('Inward entry saved successfully ✅');
    this.router.navigate(['/', AppRoutes.INOUT]);
  }
}



  setMode(mode: string) {
    const f = this.inwardForm;
    f.patchValue({
      use_existing_item: mode === 'existing',
      add_to_inventory: mode === 'new',
      is_repairing: mode === 'repairing',
      is_other: mode === 'other'
    });
  }

  autoFillSupplier() {
    const val = this.inwardForm.get('party_name')?.value;
    if (val) this.inwardForm.patchValue({ inv_supplier: val });
  }
updateInvSupplier(event: any) {
  const supplier = event.target.value;
  this.inwardForm.patchValue({
    inv_supplier: supplier
  });
}

  

}
