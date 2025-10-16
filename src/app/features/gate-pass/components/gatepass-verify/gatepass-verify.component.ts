import { Component, inject } from '@angular/core';
import { GatepassService } from '../../services/gatepass.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gatepass-verify',
  standalone: true,
  imports: [ReactiveFormsModule,FormsModule,CommonModule],
  templateUrl: './gatepass-verify.component.html',
  styleUrl: './gatepass-verify.component.scss'
})
export class GatepassVerifyComponent {
  
}
