import { Component, inject, input, signal } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { AppRoutes } from '../../../core/models/app.routes.constant';
import { CommonModule } from '@angular/common';
interface NavItem {
  label: string
  route: string[]
  icon: string
  badge?: number
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule,RouterLink,RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
   private router = inject(Router)

  routes = AppRoutes
  isCollapsed = signal<boolean>(false)
  isMobileOpen = input<boolean>(false)

  navItems: NavItem[] = [
    {
      label: "Dashboard",
      route: ["/", this.routes.DASHBOARD],
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    },
    {
      label: "Inventory",
      route: ["/", this.routes.INVENTORY],
      icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    },
    {
      label: "Purchase Indents",
      route: ["/", this.routes.PURCHASE_INDENTS],
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      badge: 3,
    },
    {
      label: "Gate Pass",
      route: ["/", this.routes.GATE_PASS],
      icon: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z",
    },
    {
      label: "Inwards/Outwards",
      route: ["/", this.routes.INOUT],
      icon: "M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4",
    },
    {
      label: "User Management",
      route: ["/", this.routes.USER_MANAGEMENT],
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    },
    {
      label: "Reports",
      route: ["/", this.routes.REPORTS],
      icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    },
    {
      label: "Company Settings",
      route: ["/", this.routes.SETTINGS, this.routes.COMPANY],
      icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
    },
  ]

  toggleCollapse() {
    this.isCollapsed.update((val:any) => !val)
  }

  isActiveRoute(route: string[]): boolean {
    const currentUrl = this.router.url
    const targetUrl = route.join("/")
    return currentUrl.startsWith(targetUrl)
  }
}
