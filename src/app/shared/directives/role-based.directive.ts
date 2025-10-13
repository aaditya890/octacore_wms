import { Directive, effect, EffectRef, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appRoleBased]',
  standalone: true
})
export class RoleBasedDirective {
   private allowedRoles: string[] = [];
  private roleEffect?: EffectRef;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {
    console.log('✅ RoleBasedDirective initialized');

    // Reactively listen to user role changes
    this.roleEffect = effect(() => {
      const user = this.authService.currentUser(); 
      const role = user?.role || null;
      this.updateView(role);
    });
  }

  // 👇 property binding jaise <p appRoleBased="['admin']">
  @Input() set appRoleBased(roles: string[]) {
    this.allowedRoles = roles;
    const user = this.authService.currentUser();
    this.updateView(user?.role || null);
  }

  private updateView(role: string | null) {
    this.viewContainer.clear();

    if (role && this.allowedRoles.map(r => r.toLowerCase()).includes(role.toLowerCase())) {
      console.log(`✅ Showing content for role: ${role}`);
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      console.log(`🚫 Hiding content for role: ${role}`);
    }
  }

  ngOnDestroy() {
    if (this.roleEffect) this.roleEffect.destroy();
  }
}
