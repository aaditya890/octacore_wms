import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { InoutService } from '../../services/inout.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { InventoryService } from '../../../inventory/services/inventory.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Transaction } from '../../../../core/models/transaction.model';
import { AppRoutes } from '../../../../core/models/app.routes.constant';
import { SettingsService } from '../../../wms-settings/services/settings.service';

@Component({
  selector: 'app-outwards-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './outwards-list.component.html',
  styleUrls: ['./outwards-list.component.scss']
})
export class OutwardsListComponent {
   private inoutService = inject(InoutService);
   private settingsService = inject(SettingsService);
  private notification = inject(NotificationService);
  private inventoryService = inject(InventoryService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  items: any[] = [];
  filteredItems: any[] = [];
  selectedItemName: string = '';
  selectedItemStock: number | null = null;
  selectedItemUnit: string = '';
  unitOptions: string[] = [];
  currentUser: any;
  outwardForm!: FormGroup;

  async ngOnInit() {
    this.unitOptions = await this.settingsService.get('unit');
    this.currentUser = this.authService.currentUser();
    this.initForm();
    await this.loadItems();
  }

  initForm() {
    this.outwardForm = this.fb.group({
      item_id: [null, Validators.required],
      item_name: [''],
      quantity: [null, [Validators.required, Validators.min(1)]],
      unit: ['', Validators.required],
      unit_price: [0],
      party_name: ['', Validators.required],
      invoice_number: ['', Validators.required],
      transaction_date: [new Date().toISOString().split('T')[0]],
      notes: [''],
      is_repairing: [false],
      expected_return_date: ['']
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

  // 🟢 When user selects an item from list
  selectItem(item: any) {
    this.filteredItems = [];
    this.selectedItemName = item.item_name;
    this.selectedItemStock = item.quantity;
    this.selectedItemUnit = item.unit;

    this.outwardForm.patchValue({
      item_id: item.id,
      unit: item.unit,
      unit_price: item.unit_price,
      notes: '' // clear remarks
    });
  }

  // 🟢 Save outward entry
  async saveOutwardEntry() {
    if (this.outwardForm.invalid) {
      this.notification.error('Please fill all required fields.');
      return;
    }

    const f = this.outwardForm.value;
    const selectedItem = this.items.find((i) => i.id === f.item_id);
    if (selectedItem && f.quantity > selectedItem.quantity) {
      this.notification.error('Not enough stock available!');
      return;
    }

    const total = (f.quantity || 0) * (f.unit_price || 0);
    const newTransaction: Transaction = {
      transaction_number: `OUT-${Date.now()}`,
      transaction_type: 'outward',
      item_id: f.item_id,
      quantity: f.quantity,
      unit_price: f.unit_price,
      total_amount: total,
      reference_type: 'manual',
      from_location: 'Main Warehouse',
      to_location: '',
      party_name: f.party_name,
      invoice_number: f.invoice_number,
      notes: f.notes,
      created_by: this.currentUser?.id || '',
      created_at: new Date().toISOString(),
      is_repairing: f.is_repairing || false,
      expected_return_date: f.expected_return_date || null
    };

    const success = await this.inoutService.addTransaction(newTransaction);

    if (success) {
      await this.inoutService.syncInventoryStock(newTransaction);
      await this.loadItems();

      this.outwardForm.reset({
        transaction_date: new Date().toISOString().split('T')[0]
      });

      // clear selection + stock info
      this.selectedItemName = '';
      this.selectedItemStock = null;
      this.selectedItemUnit = '';

      this.router.navigate(['/', AppRoutes.INOUT]);
    }
  }
}
