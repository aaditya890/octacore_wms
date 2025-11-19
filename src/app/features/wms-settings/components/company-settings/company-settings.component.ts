import { Component, inject } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-company-settings',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule,],
  templateUrl: './company-settings.component.html',
  styleUrl: './company-settings.component.scss'
})
export class CompanySettingsComponent {
  private settingsService = inject(SettingsService);
   categories: string[] = [];
  units: string[] = [];
  suppliers: string[] = [];

  newCategory = '';
  newUnit = '';
  newSupplier = '';

  showCategory = true;
  showUnit = false;
  showSupplier = false;

  async ngOnInit() {
    this.categories = await this.settingsService.get('category');
    this.units = await this.settingsService.get('unit');
    this.suppliers = await this.settingsService.get('supplier');
  }

  toggle(type: string) {
    if (type === 'category') this.showCategory = !this.showCategory;
    if (type === 'unit') this.showUnit = !this.showUnit;
    if (type === 'supplier') this.showSupplier = !this.showSupplier;
  }

  async addCategory() {
    if (await this.settingsService.add('category', this.newCategory)) {
      this.categories.push(this.newCategory);
      this.newCategory = '';
    }
  }

  async addUnit() {
    if (await this.settingsService.add('unit', this.newUnit)) {
      this.units.push(this.newUnit);
      this.newUnit = '';
    }
  }

  async addSupplier() {
    if (await this.settingsService.add('supplier', this.newSupplier)) {
      this.suppliers.push(this.newSupplier);
      this.newSupplier = '';
    }
  }

  async deleteItem(type: string, value: string) {
    const id = await this.settingsService.getId(type, value);
    if (id && await this.settingsService.delete(id)) {
      if (type === 'category') this.categories = this.categories.filter(x => x !== value);
      if (type === 'unit') this.units = this.units.filter(x => x !== value);
      if (type === 'supplier') this.suppliers = this.suppliers.filter(x => x !== value);
    }
  }
}
