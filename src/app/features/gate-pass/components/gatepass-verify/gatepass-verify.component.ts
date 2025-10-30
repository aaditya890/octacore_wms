import { Component, OnInit } from '@angular/core';
import { GatepassService } from '../../services/gatepass.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GatePassWithItems } from '../../../../core/models/gatepass.model';

@Component({
  selector: 'app-gatepass-verify',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './gatepass-verify.component.html',
  styleUrls: ['./gatepass-verify.component.scss']
})
export class GatepassVerifyComponent implements OnInit {
  code = '';
  result: GatePassWithItems | null = null;
  loading = false;
  statusMessage = '';
  statusColor = '';

  constructor(private svc: GatepassService) {}

  ngOnInit() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      this.code = code;
      this.verify();
    }
  }

  async verify() {
    if (!this.code.trim()) return;
    this.loading = true;

    const res = await this.svc.findByPassNumber(this.code.trim());
    this.loading = false;

    if (!res) {
      this.showInvalid('❌ Invalid gate pass number.');
      return;
    }

    const now = new Date();
    const validFrom = new Date(res.valid_from);
    const validTo = new Date(res.valid_to);

    const isApproved = res.status === 'approved';
    const isWithinRange =
      now.getTime() >= validFrom.getTime() &&
      now.getTime() <= validTo.getTime();

    if (isApproved && isWithinRange) {
      this.result = res;
      this.statusMessage = 'Gate Pass Verified';
      this.statusColor = 'text-green-600';
    } else if (isApproved && now > validTo) {
      this.showInvalid('⚠️ Gate Pass Expired.');
    } else if (res.status === 'pending') {
      this.showInvalid('🕒 Gate Pass not approved yet.');
    } else {
      this.showInvalid('❌ Invalid or Expired Gate Pass.');
    }
  }

  private showInvalid(msg: string) {
    this.result = null;
    this.statusMessage = msg;
    this.statusColor = 'text-red-600';
  }

  clear() {
    this.code = '';
    this.result = null;
    this.statusMessage = '';
  }

  getFormattedDate(dateStr: string): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  }
}
