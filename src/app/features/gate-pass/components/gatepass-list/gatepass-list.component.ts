import { Component, inject } from '@angular/core';
import { GatepassService } from '../../services/gatepass.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/services/auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { GatePass } from '../../../../core/models/gatepass.model';
import { RoleBasedDirective } from '../../../../shared/directives/role-based.directive';
import { routes } from '../../../../app.routes';
import { AppRoutes } from '../../../../core/models/app.routes.constant';

@Component({
  selector: 'app-gatepass-list',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, RouterLink, CommonModule, RoleBasedDirective],
  templateUrl: './gatepass-list.component.html',
  styleUrl: './gatepass-list.component.scss'
})
export class GatepassListComponent {
  gatePasses: GatePass[] = [];
  loading = false;
  currentRole = '';

  constructor(
    private svc: GatepassService,
    private auth: AuthService,
    private notify: NotificationService,
    private router: Router
  ) { }

  async ngOnInit() {
    const user = this.auth.currentUser();
    this.currentRole = user?.role ?? 'viewer';

    if (this.currentRole === 'admin') {
      this.gatePasses = await this.svc.getAllGatePasses();
    } else {
      this.gatePasses = await this.svc.getGatePassesByUser(user?.id ?? '');
    }
  }

  getStatusColor(status: any) {
    switch (status) {
      case 'approved':
        return 'text-green-600';
      case 'rejected':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  }

  async approve(id: string) {
    if (await this.svc.updateStatus(id, 'approved')) this.ngOnInit();
  }

  async reject(id: string) {
    if (await this.svc.updateStatus(id, 'rejected')) this.ngOnInit();
  }

  async delete(id: string) {
    if (confirm('Delete this gate pass?')) {
      if (await this.svc.deleteGatePass(id)) this.ngOnInit();
    }
  }


  async loadGatePasses() {
    this.loading = true;

    const user = this.auth.currentUser();
    const role = user?.role ?? 'viewer';

    if (role === 'admin') {
      this.gatePasses = await this.svc.getAllGatePasses();
    } else {
      this.gatePasses = await this.svc.getGatePassesByUser(user?.id ?? '');
    }

    this.loading = false;
  }

  goToViewGatepassReciept(passNumber:any) {
    this.router.navigate([
      '/',
      AppRoutes.GATE_PASS,
      AppRoutes.GATEPASS_RECEIPT,
      passNumber
    ]);
  }

  goToAddNewGatepass(){
    this.router.navigate([
      '/',
      AppRoutes.GATE_PASS,
      AppRoutes.CREATE_GATE_PASS
    ]);
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


goToVerifyGatepass() {
  this.router.navigate(['/', AppRoutes.GATE_PASS, AppRoutes.VERIFY_GATE_PASS]);
}

} 
