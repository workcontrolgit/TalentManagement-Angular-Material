import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgxPermissionsService, NgxRolesService } from 'ngx-permissions';
import { tap } from 'rxjs';
import { Menu, MenuService } from './menu.service';
import { OidcAuthService } from '../authentication/oidc-auth.service';

@Injectable({
  providedIn: 'root',
})
export class StartupService {
  private readonly http = inject(HttpClient);
  private readonly oidcAuth = inject(OidcAuthService);
  private readonly menuService = inject(MenuService);
  private readonly permissonsService = inject(NgxPermissionsService);
  private readonly rolesService = inject(NgxRolesService);

  /**
   * Load the application only after get the menu or other essential informations
   * such as permissions and roles.
   */
  load() {
    return new Promise<void>((resolve, reject) => {
      // Load menu from JSON file (public folder is served from root)
      this.http
        .get<{ menu: Menu[] }>('data/menu.json')
        .pipe(tap(response => this.setMenu(response.menu)))
        .subscribe({
          next: () => {
            this.setPermissions();
            resolve();
          },
          error: (err) => {
            console.error('Error loading menu:', err);
            this.setPermissions();
            resolve();
          },
        });
    });
  }

  private setMenu(menu: Menu[]) {
    this.menuService.addNamespace(menu, 'menu');
    this.menuService.set(menu);
  }

  private setPermissions() {
    // Get roles from OIDC token
    const roles = this.oidcAuth.getUserRoles();

    // Define permissions based on roles
    const permissions = ['canAdd', 'canDelete', 'canEdit', 'canRead'];
    this.permissonsService.loadPermissions(permissions);

    // Flush existing roles and add new ones
    this.rolesService.flushRoles();

    // Add roles with all permissions
    // In a real app, you would map specific permissions to specific roles
    if (roles.includes('HRAdmin')) {
      this.rolesService.addRoles({ HRAdmin: permissions });
    }
    if (roles.includes('Manager')) {
      this.rolesService.addRoles({ Manager: permissions });
    }
    if (roles.includes('Employee')) {
      this.rolesService.addRoles({ Employee: ['canRead'] });
    }
  }
}
