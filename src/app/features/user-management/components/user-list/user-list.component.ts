import { Component, inject } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,FormsModule,RouterLink],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent {
  
  private userService = inject(UserService);
  private router = inject(Router);

  users: any[] = [];

  filters = {
    role: '',
    search_term: '',
    is_active: ''
  };

  async ngOnInit() {
    await this.loadUsers();
  }

  async loadUsers() {
    const filter: any = {};

    if (this.filters.role) filter.role = this.filters.role;
    if (this.filters.search_term) filter.search_term = this.filters.search_term;
    if (this.filters.is_active) filter.is_active = this.filters.is_active === 'true';

    this.users = await this.userService.getUserList(filter);
  }

  openUserDetails(user: any) {
    this.router.navigate(['/user-management/profile', user.id]);
  }

  async toggleStatus(user: any, event: Event) {
    event.stopPropagation();

    const updated = await this.userService.updateUser(user.id, { is_active: !user.is_active });

    if (updated) {
      user.is_active = !user.is_active;
    }
  }
}
