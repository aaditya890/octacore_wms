import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { InventoryService } from '../../../inventory/services/inventory.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { InoutService } from '../../services/inout.service';
import { Transaction } from '../../../../core/models/transaction.model';

@Component({
  selector: 'app-inwards-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './inwards-list.component.html',
})
export class InwardsListComponent {
  private inventoryService = inject(InventoryService);
  private authService = inject(AuthService);
  private inoutService = inject(InoutService);
  private notification = inject(NotificationService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  items: any[] = [];
  unitOptions: string[] = ['pcs', 'kg', 'ltr', 'box', 'carton', 'meter'];
  currentUser: any;
  isNewItem = false;
  inwardForm!: FormGroup;
  filteredItems: any[] = [];
selectedItemName: string = '';

  constructor() {
    this.initForm();
  }

  async ngOnInit() {
    this.currentUser = this.authService.currentUser();
    await this.loadItems();
  }

  initForm() {
    this.inwardForm = this.fb.group({
      item_id: [null],
      quantity: [null, [Validators.required, Validators.min(1)]],
      unit: ['', Validators.required],
      unit_price: [0],
      party_name: ['', Validators.required],
      invoice_number: ['', Validators.required],
      transaction_date: [new Date().toISOString().split('T')[0]],
      notes: [''],
    });
  }

  async loadItems() {
    try {
      this.items = await this.inventoryService.getInventoryList({});
    } catch {
      this.items = [];
    }
  }

  toggleItemMode() {
    this.isNewItem = !this.isNewItem;
    this.inwardForm.patchValue({ item_id: null });
  }

  onItemChange(event: any) {
    const id = event.target.value;
    const item = this.items.find((i) => i.id === id);
    if (item) {
      this.inwardForm.patchValue({
        unit: item.unit,
        unit_price: item.unit_price,
        notes: `Category: ${item.category}, Current Qty: ${item.quantity}`,
      });
    }
  }

  async saveInwardEntry() {
    if (this.inwardForm.invalid) {
      this.notification.error('Please fill all required fields.');
      return;
    }

    const f = this.inwardForm.value;
    const total = (f.quantity || 0) * (f.unit_price || 0);

    const newTransaction: Transaction = {
      transaction_number: `IN-${Date.now()}`,
      transaction_type: 'inward',
      item_id: f.item_id || null,
      quantity: f.quantity,
      unit_price: f.unit_price,
      total_amount: total,
      reference_type: 'manual',
      from_location: null,
      to_location: 'Main Warehouse',
      party_name: f.party_name,
      invoice_number: f.invoice_number,
      notes: f.notes,
      created_by: this.currentUser?.id || null,
      created_at: new Date().toISOString(),
    };

    const success = await this.inoutService.addTransaction(newTransaction);

    if (success) {
      await this.inoutService.syncInventoryStock(newTransaction);
      this.router.navigate(['/inwards-outwards']);
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

  // Bind the item id to form
  this.inwardForm.patchValue({
    item_id: item.id,
    unit: item.unit,
    unit_price: item.unit_price,
    notes: `Category: ${item.category}, Current Qty: ${item.quantity}`,
  });
}
}
