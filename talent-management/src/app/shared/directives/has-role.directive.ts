import { Directive, Input, TemplateRef, ViewContainerRef, inject, OnInit, OnDestroy } from '@angular/core';
import { OidcAuthService } from '../../core/authentication/oidc-auth.service';
import { Subscription } from 'rxjs';

/**
 * Structural directive to show/hide elements based on user roles
 * Usage:
 * <div *hasRole="'HRAdmin'">Only HRAdmin can see this</div>
 * <div *hasRole="['Manager', 'HRAdmin']">Managers and HRAdmins can see this</div>
 */
@Directive({
  selector: '[hasRole]',
  standalone: true,
})
export class HasRoleDirective implements OnInit, OnDestroy {
  private authService = inject(OidcAuthService);
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private subscription?: Subscription;

  @Input() set hasRole(roles: string | string[]) {
    this.updateView(roles);
  }

  ngOnInit(): void {
    // Subscribe to authentication changes
    this.subscription = this.authService.isAuthenticated$.subscribe(() => {
      const roles = this.roles;
      if (roles) {
        this.updateView(roles);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private roles?: string | string[];

  private updateView(roles: string | string[]): void {
    this.roles = roles;
    this.viewContainer.clear();

    const hasRole = this.checkRole(roles);

    if (hasRole) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }

  private checkRole(roles: string | string[]): boolean {
    if (!this.authService.isAuthenticated()) {
      return false;
    }

    if (typeof roles === 'string') {
      return this.authService.hasRole(roles);
    }

    if (Array.isArray(roles)) {
      return this.authService.hasAnyRole(roles);
    }

    return false;
  }
}
