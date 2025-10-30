import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GatepassService } from '../../services/gatepass.service';
import { GatePassWithItems } from '../../../../core/models/gatepass.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-gatepass-receipt',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './gatepass-receipt.component.html',
  styleUrls: ['./gatepass-receipt.component.scss']
})

export class GatepassReceiptComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private svc = inject(GatepassService);

  data: GatePassWithItems | null = null;
  loading = true;

  async ngOnInit() {
    const passNum = this.route.snapshot.paramMap.get('pass_number');
    if (passNum) await this.loadData(passNum);
  }

  async loadData(passNum: string) {
    this.loading = true;
    this.data = await this.svc.findByPassNumber(passNum);
    this.loading = false;
  }

  print() {
    window.print();
  }

  back() {
    this.router.navigate(['/gatepass']);
  }

  getFormattedDate(dateStr:any): string {
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
