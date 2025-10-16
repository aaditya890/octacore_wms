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
      // ✅ Invoice alphanumeric only
      invoice_number: [
        '',
        [Validators.required, Validators.pattern(/^[a-zA-Z0-9 ]+$/)],
      ],
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
    this.filteredItems = [];
    this.selectedItemName = '';
    this.inwardForm.patchValue({
      item_id: null,
      unit: '',
      unit_price: 0,
      notes: '',
    });
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

  // 🟢 Handle name properly
  const itemName =
    this.isNewItem && f.notes
      ? f.notes.trim() // for new item (typed manually)
      : this.selectedItemName || '-'; // for existing

  const newTransaction: Transaction = {
    transaction_number: `IN-${Date.now()}`,
    transaction_type: 'inward',
    item_id: this.isNewItem ? null : f.item_id,
    quantity: f.quantity,
    unit_price: f.unit_price,
    total_amount: total,
    reference_type: 'manual',
    from_location: null,
    to_location: 'Main Warehouse',
    party_name: f.party_name,
    invoice_number: f.invoice_number,
    // 🟢 Save readable item name in notes or extra field
    notes: `Item: ${itemName}\n${f.notes || ''}`,
    created_by: null,
    created_at: new Date().toISOString(),
  };

  const success = await this.inoutService.addTransaction(newTransaction);

  if (success) {
    await this.inoutService.syncInventoryStock(newTransaction);
    this.router.navigate(["/", AppRoutes.INOUT]);
  }
}



}
