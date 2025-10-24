import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-in-out-details',
  standalone: true,
  imports: [MatDialogModule,CommonModule],
  templateUrl: './in-out-details.component.html',
  styleUrls: ['./in-out-details.component.scss']
})
export class InOutDetailsComponent {
   constructor(
    public dialogRef: MatDialogRef<InOutDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}
