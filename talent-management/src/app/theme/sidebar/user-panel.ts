import { Component, ViewEncapsulation, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { OidcAuthService } from '../../core/authentication/oidc-auth.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-user-panel',
  template: `
    <div class="matero-user-panel" routerLink="/profile/overview">
      <mat-icon class="matero-user-panel-avatar">account_circle</mat-icon>
      <div class="matero-user-panel-info">
        <h4>{{ getUserName() }}</h4>
        <h5>{{ getUserEmail() }}</h5>
      </div>
    </div>
  `,
  styleUrl: './user-panel.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatTooltipModule, TranslateModule],
})
export class UserPanel {
  private readonly oidcAuth = inject(OidcAuthService);

  getUserName(): string {
    if (!this.oidcAuth.isAuthenticated()) {
      return 'Guest';
    }
    const userInfo = this.oidcAuth.getUserInfo();
    return userInfo?.name || userInfo?.preferred_username || 'User';
  }

  getUserEmail(): string {
    if (!this.oidcAuth.isAuthenticated()) {
      return 'Not logged in';
    }
    const userInfo = this.oidcAuth.getUserInfo();
    return userInfo?.email || '';
  }
}
