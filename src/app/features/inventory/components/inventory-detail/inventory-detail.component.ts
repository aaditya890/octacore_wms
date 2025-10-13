import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { InventoryItem } from '../../../../core/models/inventory.model';
import { InventoryListComponent } from '../inventory-list/inventory-list.component';

@Component({
  selector: 'app-inventory-detail',
  standalone: true,
  imports: [],
  templateUrl: './inventory-detail.component.html',
  styleUrl: './inventory-detail.component.scss'
})
export class InventoryDetailComponent {

     constructor(
    public dialogRef: MatDialogRef<InventoryListComponent>,
    @Inject(MAT_DIALOG_DATA) public data: InventoryItem
  ) {}
} 
