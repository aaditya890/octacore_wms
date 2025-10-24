import { Component, inject } from '@angular/core';
import { GatepassService } from '../../services/gatepass.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GatePassWithItems } from '../../../../core/models/gatepass.model';

@Component({
  selector: 'app-gatepass-verify',
  standalone: true,
  imports: [ReactiveFormsModule,FormsModule,CommonModule],
  templateUrl: './gatepass-verify.component.html',
  styleUrl: './gatepass-verify.component.scss'
})
export class GatepassVerifyComponent {
     code = '';
  result: GatePassWithItems | null = null;
  loading = false;

  constructor(private svc: GatepassService) {}

  async verify() {
    if (!this.code.trim()) return;
    this.loading = true;
    this.result = await this.svc.findByPassNumber(this.code.trim());
    this.loading = false;
  }

  clear() {
    this.code = '';
    this.result = null;
  }
} 
