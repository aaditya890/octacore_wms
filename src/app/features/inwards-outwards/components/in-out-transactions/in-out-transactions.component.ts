import { Component, inject, ViewChild } from '@angular/core';
import { InoutService } from '../../services/inout.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InventoryService } from '../../../inventory/services/inventory.service';
import { AppRoutes } from '../../../../core/models/app.routes.constant';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { InOutDetailsComponent } from '../in-out-details/in-out-details.component';

@Component({
  selector: 'app-in-out-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatPaginatorModule, MatProgressSpinnerModule, MatDialogModule],
  templateUrl: './in-out-transactions.component.html',
  styleUrl: './in-out-transactions.component.scss'
})

export class InOutTransactionsComponent {
  private inoutService = inject(InoutService);
  private inventoryService = inject(InventoryService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  displayedColumns = [
    'sr_no',
    'transaction_type',
    'item',
    'quantity',
    'unit',
    'unit_price',
    'total_value',
    'party_name',
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
    console.log();

  }
  async loadTransactions(event?: PageEvent) {
    try {
      this.loading = true;

      // Pagination handling
      if (event) {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
      }

      // Filters setup
      const filter: any = {};
      if (
        this.filterType !== 'all' &&
        this.filterType !== 'repairing' &&
        this.filterType !== 'other'
      ) {
        filter.transaction_type = this.filterType;
      }

      if (this.selectedDate) {
        filter.selected_date = this.selectedDate;
      }

      // Fetch transactions + inventory in parallel
      const [paged, items] = await Promise.all([
        this.inoutService.getTransactionListPaged(this.pageIndex, this.pageSize, filter),
        this.inventoryService.getInventoryList({})
      ]);

      console.log('Paged transactions:', paged.data);
      // 🔹 Merge transactions with inventory info
      let merged = (paged?.data || []).map((t: any, i: number) => {
        const item = items.find((x: any) => x.id === t.item_id);
        const unitPrice = t.unit_price ?? item?.unit_price ?? 0;
        const totalValue = (t.quantity || 0) * unitPrice;

        // Normalize repairing/other
        const noteStr = (t.notes || '').toLowerCase();
        const normRepair =
          t.is_repairing === true ||
          t.is_repairing === 'true' ||
          t.is_repairing === 1 ||
          noteStr.includes('repair') ||
          noteStr.includes('service') ||
          noteStr.includes('maintenance');

        const normOther =
          t.is_other === true ||
          t.is_other === 'true' ||
          t.is_other === 1 ||
          noteStr.includes('other') ||
          noteStr.includes('misc') ||
          noteStr.includes('etc');

        // ✅ Item Name Resolve
        let itemName = '—';

        // 1️⃣ Linked inventory item
        if (item?.item_name && item.item_name !== '-') {
          itemName = item.item_name;
        }

        // 2️⃣ Direct name from transaction (if present)
        else if (t.item_display_name && t.item_display_name.trim() !== '') {
          itemName = t.item_display_name.trim();
        }

        // 3️⃣ Fallback for repairing/other legacy entries
        else if (normRepair || normOther) {
          const extracted = this.extractItemName(t.notes);
          itemName = extracted && extracted !== '-' ? extracted : (normRepair ? 'Repairing Item' : 'Other Item');
        }

        // 4️⃣ Final fallback
        else {
          const extracted = this.extractItemName(t.notes);
          itemName = extracted && extracted !== '-' ? extracted : '—';
        }

        // ✅ Unit logic
        const unit =
          item?.unit ??
          t.unit ??
          (t.notes?.toLowerCase().includes('repair')
            ? 'pcs'
            : t.notes?.toLowerCase().includes('other')
              ? 'pcs'
              : 'pcs');

        return {
          ...t,
          sr_no: this.pageIndex * this.pageSize + i + 1,
          item_name: itemName,
          unit,
          unit_price: unitPrice,
          total_value: totalValue,
          is_repairing: normRepair,
          is_other: normOther,
        };
      });

      // Debugging
      console.table(
        merged.map((x) => ({
          item: x.item_name,
          repair: x.is_repairing,
          other: x.is_other,
        }))
      );

      // 🔍 Frontend search
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

      // Filter by type (Repairing / Other)
      if (this.filterType === 'repairing') {
        merged = merged.filter((t: any) => t.is_repairing === true);
      } else if (this.filterType === 'other') {
        merged = merged.filter((t: any) => t.is_other === true);
      }

      this.dataSource.data = merged;
      this.totalLength = paged?.total || merged.length;

    } catch (error) {
      console.error('[v2] Error loading transactions:', error);
    } finally {
      this.loading = false;
    }
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
    this.router.navigate(["/", AppRoutes.INOUT, AppRoutes.INWARDS]);
  }

  addOutward() {
    this.router.navigate(["/", AppRoutes.INOUT, AppRoutes.OUTWARDS]);
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

  extractItemName(notes: any): string {
    if (!notes) return '';

    const str = String(notes).replace(/\r?\n|\r/g, ' ').trim();

    // match after "Item:" or "item:"
    const match = str.match(/item[:\-]?\s*([a-zA-Z0-9 _-]+)/i);

    if (match && match[1]) {
      let name = match[1].trim();
      // remove junk like extra dash or colon
      name = name.replace(/^[-: ]+/, '').trim();
      return name || '-';
    }

    // fallback if nothing matched
    return '-';
  }


  viewDetails(transaction: any) {
    this.dialog.open(InOutDetailsComponent, {
      width: '500px',
      data: transaction,
      panelClass: 'custom-dialog-container'
    });
  }




}
