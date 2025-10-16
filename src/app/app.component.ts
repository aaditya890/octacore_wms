import { CommonModule, NgClass } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AppRoutes } from './core/models/app.routes.constant';
import { HeaderComponent } from "./shared/components/header/header.component";
import { SidebarComponent } from "./shared/components/sidebar/sidebar.component";
import { DashboardComponent } from "./features/dashboard/components/dashboard/dashboard.component";
import { AuthService } from './core/services/auth.service';
import { RoleBasedDirective } from './shared/directives/role-based.directive';
import { HighlightDirective } from './shared/directives/highlight.directive';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent {
  title = 'octacore_frontend';
   routes = AppRoutes; 
   constructor(private auth:AuthService){}
   ngOnInit() {
    const user = this.auth.getCurrentUser();
    console.log('Current User:', user);
}}
