import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IndentService } from '../../services/indent.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/services/auth.service';
import { PurchaseIndent } from '../../../../core/models/indent.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-indent-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './indent-list.component.html',
  styleUrls: ['./indent-list.component.scss']
})
export class IndentListComponent implements OnInit {
  private indentService = inject(IndentService);
  private toast = inject(NotificationService);
  private auth = inject(AuthService);

  indents: PurchaseIndent[] = [];
  isLoading = true;
  search = '';
  status: any = 'all';
  priority: 'all' | 'Low' | 'Medium' | 'High' | 'Urgent' = 'all';
  total = 0;

  // 👇 new props for modal
  selectedIndent: any = null;
  reason = '';
  currentUser: any;

  async ngOnInit() {
    this.currentUser = this.auth.currentUser();
    console.log('User role:', this.currentUser?.role);
    await this.loadIndents();
  }

  async loadIndents() {
    this.isLoading = true;
    try {
      const { rows, total } = await this.indentService.list({
        search: this.search,
        status: this.status,
        priority: this.priority,
        role: this.currentUser?.role,
        userId: this.currentUser?.id
      });

      this.indents = rows;
      this.total = total;
    } catch (err) {
      this.toast.error('Failed to load indents');
    } finally {
      this.isLoading = false;
    }
  }

  async onFilterChange() {
    await this.loadIndents();
  }

  // 👇 open modal
  async viewIndent(id: any) {
    try {
      this.isLoading = true;
      const data = await this.indentService.getIndentById(id);
      this.selectedIndent = data;
      console.log(this.selectedIndent.status);
    } catch (err) {
      this.toast.error('Failed to load indent details');
    } finally {
      this.isLoading = false;
    }
  }

  closeDetails() {
    this.selectedIndent = null;
  }

  async approve() {
    if (!this.selectedIndent) return;
    try {
      await this.indentService.updateIndentStatus(
        this.selectedIndent.id,
        'approved',
        undefined,
        this.currentUser?.id
      );
      this.toast.success('Indent approved');
      this.selectedIndent.status = 'approved';
      this.closeDetails();
      await this.loadIndents();
    } catch (e) {
      this.toast.error('Error approving indent');
    }
  }

  async reject() {
    if (!this.selectedIndent || !this.reason.trim())
      return this.toast.error('Enter reason to reject');
    try {
      await this.indentService.updateIndentStatus(
        this.selectedIndent.id,
        'rejected',
        this.reason
      );
      this.toast.success('Indent rejected');
      this.selectedIndent.status = 'rejected';
      this.reason = '';
      this.closeDetails();
      await this.loadIndents();
    } catch (e) {
      this.toast.error('Error rejecting indent');
    }
  }

  async markCompleted() {
    if (!this.selectedIndent) return;
    try {
      await this.indentService.updateIndentStatus(this.selectedIndent.id, 'completed');
      this.toast.success('Indent marked as completed');
      this.selectedIndent.status = 'completed';
          this.closeDetails();
      await this.loadIndents();
    } catch (e) {
      this.toast.error('Error marking as completed');
    }
  }

  async confirmDelete(id: any) {
  const confirm = window.confirm("Are you sure you want to delete this indent?");
  if (!confirm) return;
  try {
    await this.indentService.deleteIndent(id);
    this.toast.success("Indent deleted successfully.");
    await this.loadIndents(); // refresh list
  } catch (err) {
    console.error(err);
    this.toast.error("Failed to delete indent.");
  }
}

getTotalEstimated(indent: any): number {
    if (!indent?.indent_items || !Array.isArray(indent.indent_items)) {
      return 0;
    }
    return indent.indent_items.reduce((acc: number, item: any) => {
      const qty = Number(item?.quantity) || 0;
      const price = Number(item?.estimated_price) || 0;
      return acc + qty * price;
    }, 0);
  }

}
