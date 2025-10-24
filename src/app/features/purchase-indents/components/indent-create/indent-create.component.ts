import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IndentItem, PurchaseIndent } from '../../../../core/models/indent.model';
import { IndentService } from '../../services/indent.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';
import { AppRoutes } from '../../../../core/models/app.routes.constant';
import { UserService } from '../../../user-management/services/user.service';

@Component({
  selector: 'app-indent-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './indent-create.component.html',
  styleUrls: ['./indent-create.component.scss']
})
export class IndentCreateComponent implements OnInit {
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private indentService = inject(IndentService);
  private toast = inject(NotificationService);
  private auth = inject(AuthService);
  users: any[] = [];
  managers: any[] = [];
  units = ["pcs", "kg", "ltr", "box", "carton", "meter"];

  form!: FormGroup;
  currentUser: any;
  isSubmitting = false;

  async ngOnInit() {
    this.initForm();
    this.getUser();
    await this.loadUserDropdowns();
  }

  async loadUserDropdowns() {
  try {
    // 🟢 1. All active users for Requested By
    this.users = await this.userService.getUserList();

    // 🟢 2. Filtered list for Assigned To (only admins/managers)
    this.managers = await this.userService.getUserList({ role: 'admin' });
    const managerList = await this.userService.getUserList({ role: 'manager' });

    this.managers = [...this.managers, ...managerList];
  } catch (err) {
    console.error('Error loading user list:', err);
  }
}


  /** 🔹 Initialize FormBuilder form */
  initForm() {
    this.form = this.fb.group({
      title: [''],
      department: ['', Validators.required],
      priority: ['Medium', Validators.required],
      required_date: ['', Validators.required],
      requested_by: [''], // filled automatically
      assigned_to: ['', Validators.required],
      notes: [''],
      items: this.fb.array([])
    });
    this.addItemRow(); // add first row by default
  }

  /** 🔹 Get current user from AuthService */
  getUser() {
    const user = this.auth.currentUser(); // ensure returns stored user object
    if (user) {
      this.currentUser = user;
      this.form.patchValue({
        requested_by: user.id
      });
    }
  }

  /** 🔹 Form Array getter */
  get itemsFA() {
    return this.form.get('items') as FormArray;
  }

  /** 🔹 Add / Remove Rows */
  addItemRow() {
    const row = this.fb.group({
      item_name: ['', Validators.required],
      description: [''],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unit: ['pcs', Validators.required],
      estimated_price: [null]
    });
    this.itemsFA.push(row);
  }

  removeItemRow(index: number) {
    this.itemsFA.removeAt(index);
  }

  /** 🔹 Submit Form */
  async submit() {
    if (this.form.invalid || this.itemsFA.length === 0) {
      this.toast.error('Please fill all required fields.');
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    try {
      const val = this.form.value;

      // 🔸 Auto approval check
      let status = 'pending';
      let approved_by: string | null = null;
      let approved_at: string | null = null;

      if (this.currentUser?.role === 'admin' || this.currentUser?.role === 'manager') {
        status = 'approved';
        approved_by = this.currentUser.id;
        approved_at = new Date().toISOString();
      }

      // 🔸 Payload clean & aligned to DB fields
      const payload = {
        title: val.title || null,
        department: val.department,
        priority: val.priority.toLowerCase(),
        required_date: val.required_date,
        requested_by: val.requested_by,
        assigned_to: val.assigned_to,
        notes: val.notes || null,
        status,
        approved_by,
        approved_at,
        items: val.items
      };

      const created = await this.indentService.createIndent(payload);

      this.toast.success(`Indent ${created.indent_number} created successfully.`);

      // Reset form after save
      this.form.reset({
        priority: 'medium',
        department: this.currentUser?.department || '',
        requested_by: this.currentUser?.id
      });
      this.itemsFA.clear();
      this.addItemRow();
      this.router.navigate(['/', AppRoutes.PURCHASE_INDENTS, AppRoutes.LIST_INDENTS]);

    } catch (err: any) {
      console.error('Error creating indent:', err);
      this.toast.error(err?.message || 'Failed to create indent.');
    } finally {
      this.isSubmitting = false;
    }
  }

}
