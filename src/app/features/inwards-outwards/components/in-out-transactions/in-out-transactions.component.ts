import { Component, inject, ViewChild } from '@angular/core';
import { InoutService } from '../../services/inout.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InventoryService } from '../../../inventory/services/inventory.service';

@Component({
  selector: 'app-in-out-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatPaginatorModule, MatProgressSpinnerModule],
  templateUrl: './in-out-transactions.component.html',
  styleUrl: './in-out-transactions.component.scss'
})

export class InOutTransactionsComponent {
  private inoutService = inject(InoutService);
  private inventoryService = inject(InventoryService);
  private router = inject(Router);

  displayedColumns = [
  'sr_no',
  'transaction_type',
  'item_name',
  'quantity',
  'unit',
  'unit_price',
  'total_value',
  'party_name',
  'invoice_number',
  'created_at',
  'actions'
];


  dataSource = new MatTableDataSource<any>([]);
  loading = true;
  totalLength = 0;
  pageSize = 10;
  pageIndex = 0;

  // Filters
  filterType = 'all';
  searchTerm = '';
  selectedDate: string = '';
  

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  async ngOnInit() {
    await this.loadTransactions();
  }

async loadTransactions(event?: PageEvent) {
  this.loading = true;
  if (event) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  const filter: any = {};
  if (this.filterType !== 'all') filter.transaction_type = this.filterType;
  if (this.selectedDate) filter.selected_date = this.selectedDate;

  const [paged, items] = await Promise.all([
    this.inoutService.getTransactionListPaged(this.pageIndex, this.pageSize, filter),
    this.inventoryService.getInventoryList({})
  ]);

  // merge item details
  let merged = paged.data.map((t, i) => {
    const item = items.find(x => x.id === t.item_id);
    const unitPrice = t.unit_price ?? item?.unit_price ?? 0;
    const totalValue = (t.quantity || 0) * unitPrice;
    return {
      ...t,
      sr_no: this.pageIndex * this.pageSize + i + 1,
      item_name: item?.item_name ?? '—',
      unit: item?.unit ?? '',
      unit_price: unitPrice,
      total_value: totalValue,
    };
  });

  // 🔍 frontend search on item_name, party_name, invoice_number
  if (this.searchTerm.trim()) {
    const term = this.searchTerm.toLowerCase();
    merged = merged.filter(
      (t) =>
        (t.item_name && t.item_name.toLowerCase().includes(term)) ||
        (t.party_name && t.party_name.toLowerCase().includes(term)) ||
        (t.invoice_number && t.invoice_number.toLowerCase().includes(term)) ||
        (t.notes && t.notes.toLowerCase().includes(term))
    );
  }

  this.dataSource.data = merged;
  this.totalLength = merged.length;
  this.loading = false;
}


  async applyFilter() {
    this.pageIndex = 0;
    await this.loadTransactions();
  }

  clearFilters() {
    this.searchTerm = '';
    this.filterType = 'all';
    this.selectedDate = '';
    this.applyFilter();
  }

  getDisplayRange(): string {
    if (this.totalLength === 0) return '0 of 0';
    const start = this.pageIndex * this.pageSize + 1;
    const end = Math.min((this.pageIndex + 1) * this.pageSize, this.totalLength);
    return `${start} - ${end} of ${this.totalLength}`;
  }

  addInward() {
    this.router.navigate(['/inwards-outwards/inwards']);
  }

  addOutward() {
    this.router.navigate(['/inwards-outwards/outwards']);
  }

  async deleteTransaction(transaction: any) {
  const confirmDelete = confirm(
    `Are you sure you want to delete this ${transaction.transaction_type} transaction for "${transaction.item_name}"?`
  );

  if (!confirmDelete) return;

  try {
    // Disable UI during deletion (optional)
    this.loading = true;

    const success = await this.inoutService.deleteTransaction(transaction.id);

    if (success) {
      // Reload table
      await this.loadTransactions();
    }
  } catch (error) {
    console.error('Error deleting transaction:', error);
  } finally {
    this.loading = false;
  }
}

}
