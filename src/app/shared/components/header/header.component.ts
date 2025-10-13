import { Component, inject, output, signal } from '@angular/core';
import { AppRoutes } from '../../../core/models/app.routes.constant';
import { AuthService } from '../../../core/services/auth.service';
import { StorageService } from '../../../core/services/storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})

export class HeaderComponent {
  private authService = inject(AuthService)
  private storageService = inject(StorageService)
  private router = inject(Router)

  routes = AppRoutes
  isDarkMode = signal<boolean>(false)
  isUserMenuOpen = signal<boolean>(false)

  // Output event for mobile menu toggle
  toggleSidebar = output<void>()

  ngOnInit() {
    // Load dark mode preference from storage
    const savedTheme = this.storageService.getItem("theme")
    this.isDarkMode.set(savedTheme === "dark")
    this.applyTheme()
  }

  toggleDarkMode() {
    this.isDarkMode.update((val:any) => !val)
    this.storageService.setItem("theme", this.isDarkMode() ? "dark" : "light")
    this.applyTheme()
  }

  private applyTheme() {
    if (this.isDarkMode()) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  toggleUserMenu() {
    this.isUserMenuOpen.update((val) => !val)
  }

  onToggleSidebar() {
    this.toggleSidebar.emit()
  }

  logout() {
    // this.authService.logout()
    this.router.navigate(["/", this.routes.AUTH, this.routes.LOGIN])
  }

  navigateToProfile() {
    this.router.navigate(["/", this.routes.SETTINGS, this.routes.PROFILE])
    this.isUserMenuOpen.set(false)
  }
}
