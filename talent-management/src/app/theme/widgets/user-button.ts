import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { SettingsService } from '@core';
import { OidcAuthService } from '../../core/authentication/oidc-auth.service';

@Component({
  selector: 'app-user',
  template: `
    <button matIconButton [matMenuTriggerFor]="menu">
      <mat-icon>account_circle</mat-icon>
    </button>

    <mat-menu #menu="matMenu">
      <div class="user-info">
        <div class="user-name">{{ getUserName() }}</div>
        <div class="user-email">{{ getUserEmail() }}</div>
        <div class="user-roles">{{ getUserRoles() }}</div>
      </div>
      <mat-divider></mat-divider>
      <button routerLink="/profile/overview" mat-menu-item>
        <mat-icon>account_circle</mat-icon>
        <span>{{ 'profile' | translate }}</span>
      </button>
      <button routerLink="/profile/settings" mat-menu-item>
        <mat-icon>edit</mat-icon>
        <span>{{ 'edit_profile' | translate }}</span>
      </button>
      <button mat-menu-item (click)="restore()">
        <mat-icon>restore</mat-icon>
        <span>{{ 'restore_defaults' | translate }}</span>
      </button>
      <button mat-menu-item (click)="logout()">
        <mat-icon>exit_to_app</mat-icon>
        <span>{{ 'logout' | translate }}</span>
      </button>
    </mat-menu>
  `,
  styles: `
    .user-info {
      padding: 16px;
      max-width: 250px;

      .user-name {
        font-weight: 500;
        font-size: 14px;
        margin-bottom: 4px;
      }

      .user-email {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.6);
        margin-bottom: 4px;
      }

      .user-roles {
        font-size: 11px;
        color: rgba(0, 0, 0, 0.5);
        font-style: italic;
      }
    }
  `,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatMenuModule, MatDividerModule, TranslateModule],
})
export class UserButton {
  private readonly oidcAuth = inject(OidcAuthService);
  private readonly router = inject(Router);
  private readonly settings = inject(SettingsService);

  getUserName(): string {
    const userInfo = this.oidcAuth.getUserInfo();
    return userInfo?.name || 'Guest';
  }

  getUserEmail(): string {
    const userInfo = this.oidcAuth.getUserInfo();
    return userInfo?.email || '';
  }

  getUserRoles(): string {
    const roles = this.oidcAuth.getUserRoles();
    return roles.length > 0 ? roles.join(', ') : 'No roles';
  }

  logout() {
    this.oidcAuth.logout();
    this.router.navigateByUrl('/login');
  }

  restore() {
    this.settings.reset();
    window.location.reload();
  }
}
