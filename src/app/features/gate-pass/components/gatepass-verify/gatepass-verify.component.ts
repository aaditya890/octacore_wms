import { Component, OnInit } from '@angular/core';
import { GatepassService } from '../../services/gatepass.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GatePassWithItems } from '../../../../core/models/gatepass.model';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';

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
  scanning = false;
  scanner: any;

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
      now.getTime() >= validFrom.getTime() && now.getTime() <= validTo.getTime();

    if (isApproved && isWithinRange) {
      this.result = res;
      this.statusMessage = '✅ Gate Pass Verified Successfully';
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

  // ✅ FIXED SCANNER FUNCTION (full screen + back camera)
  startScanner() {
    this.scanning = true;

    // Destroy previous instance if running
    if (this.scanner) {
      this.scanner.clear().catch(() => {});
      this.scanner = null;
    }

    const config = {
      fps: 10,
      qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
        const minEdgePercentage = 0.8; // 80% of screen width
        const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
        const qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
        return { width: qrboxSize, height: qrboxSize };
      },
      rememberLastUsedCamera: true,
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
    };

    this.scanner = new Html5QrcodeScanner('reader', config, false);

    this.scanner.render(
      async (decodedText: string) => {
        console.log('✅ Scanned:', decodedText);
        this.code = decodedText.split('code=')[1] || decodedText;
        await this.verify();
        this.stopScanner();
      },
      (error:Error) => {
        console.warn('QR Scan Error:', error);
      }
    );
  }

  stopScanner() {
    if (this.scanner) {
      this.scanner.clear().then(() => {
        this.scanning = false;
      });
    } else {
      this.scanning = false;
    }
  }
}
