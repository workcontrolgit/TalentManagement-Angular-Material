import { Component, ViewEncapsulation, inject, OnInit, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { OidcAuthService } from '../../core/authentication/oidc-auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-panel',
  template: `
    <div class="matero-user-panel" routerLink="/profile/overview">
      <mat-icon class="matero-user-panel-avatar">account_circle</mat-icon>
      <div class="matero-user-panel-info">
        <h4>{{ userName }}</h4>
        <h5>{{ userEmail }}</h5>
      </div>
    </div>
  `,
  styleUrl: './user-panel.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, MatTooltipModule, TranslateModule],
})
export class UserPanel implements OnInit, OnDestroy {
  private readonly oidcAuth = inject(OidcAuthService);
  private authSubscription?: Subscription;

  userName = 'Guest';
  userEmail = 'Anonymous';

  ngOnInit(): void {
    // Set initial values
    this.updateUserInfo();

    // Subscribe to authentication state changes
    this.authSubscription = this.oidcAuth.isAuthenticated$.subscribe(() => {
      this.updateUserInfo();
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }

  private updateUserInfo(): void {
    if (!this.oidcAuth.isAuthenticated()) {
      this.userName = 'Guest';
      this.userEmail = 'Anonymous';
      return;
    }

    const userInfo = this.oidcAuth.getUserInfo();
    this.userName = userInfo?.name || userInfo?.preferred_username || 'User';
    this.userEmail = userInfo?.email || '';
  }
}
