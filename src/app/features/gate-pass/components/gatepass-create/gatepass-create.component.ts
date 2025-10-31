import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';
import { GatepassService } from '../../services/gatepass.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { AppRoutes } from '../../../../core/models/app.routes.constant';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gatepass-create',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './gatepass-create.component.html',
  styleUrl: './gatepass-create.component.scss'
})
export class GatepassCreateComponent {
   form: FormGroup;
  passTypes = ['material', 'visitor', 'vehicle', 'returnable'];

  constructor(private fb: FormBuilder, private svc: GatepassService,private router:Router) {
    this.form = this.fb.group({
      pass_type: ['', Validators.required],
      party_name: ['', Validators.required],
      party_contact: [''],
      vehicle_number: [''],
      purpose: ['', Validators.required],
      valid_from: ['', Validators.required],
      valid_to: ['', Validators.required],
      notes: [''],
      items: this.fb.array([]),
    });
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  addItem() {
    this.items.push(
      this.fb.group({
        item_name: ['', Validators.required],
        description: [''],
        quantity: [1, Validators.required],
        unit: ['', Validators.required],
      })
    );
  }

  removeItem(i: number) {
    this.items.removeAt(i);
  }

async onSubmit() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const { items, ...gatepass } = this.form.value;

  const payload = {
    ...gatepass,
    valid_from: new Date(gatepass.valid_from).toISOString(),
    valid_to: new Date(gatepass.valid_to).toISOString(),
  };

  // 1️⃣ Create pass
  const created = await this.svc.createGatePass(payload, items);

  if (created) {
    // 2️⃣ Generate QR Code for that pass
    const qrUrl = await this.svc.generateQr(created.pass_number);

    // 3️⃣ Pass QR via navigation state to receipt
    this.router.navigate(
      ['/', AppRoutes.GATE_PASS, 'receipt', created.pass_number],
      { state: { qr: qrUrl } }
    );
  }

  this.form.reset();
  this.items.clear();
}



}
