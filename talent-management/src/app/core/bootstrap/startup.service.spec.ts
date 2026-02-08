import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { NgxPermissionsModule, NgxPermissionsService, NgxRolesService } from 'ngx-permissions';
import { provideOAuthClient } from 'angular-oauth2-oidc';
import { OidcAuthService } from '@core/authentication';
import { MenuService } from '@core/bootstrap/menu.service';
import { StartupService } from '@core/bootstrap/startup.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('StartupService', () => {
  let httpMock: HttpTestingController;
  let startup: StartupService;
  let oidcAuthService: OidcAuthService;
  let menuService: MenuService;
  let mockPermissionsService: NgxPermissionsService;
  let mockRolesService: NgxRolesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxPermissionsModule.forRoot()],
      providers: [
        provideOAuthClient(),
        {
          provide: NgxPermissionsService,
          useValue: {
            loadPermissions: (permissions: string[]) => void 0,
          },
        },
        {
          provide: NgxRolesService,
          useValue: {
            flushRoles: () => void 0,
            addRoles: (params: any) => void 0,
          },
        },
        StartupService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    startup = TestBed.inject(StartupService);
    oidcAuthService = TestBed.inject(OidcAuthService);
    menuService = TestBed.inject(MenuService);
    mockPermissionsService = TestBed.inject(NgxPermissionsService);
    mockRolesService = TestBed.inject(NgxRolesService);
  });

  afterEach(() => httpMock.verify());

  it('should load menu from JSON file', async () => {
    const menuData = { menu: [] };
    spyOn(menuService, 'addNamespace');
    spyOn(menuService, 'set');
    spyOn(mockPermissionsService, 'loadPermissions');
    spyOn(mockRolesService, 'flushRoles');
    spyOn(mockRolesService, 'addRoles');

    const loadPromise = startup.load();

    // Flush HTTP request before awaiting the promise
    httpMock.expectOne('data/menu.json').flush(menuData);

    await loadPromise;

    expect(menuService.addNamespace).toHaveBeenCalledWith(menuData.menu, 'menu');
    expect(menuService.set).toHaveBeenCalledWith(menuData.menu);
    expect(mockPermissionsService.loadPermissions).toHaveBeenCalled();
    expect(mockRolesService.flushRoles).toHaveBeenCalled();
  });

  it('should set permissions for authenticated user with HRAdmin role', () => {
    const permissions = ['canAdd', 'canDelete', 'canEdit', 'canRead'];
    spyOn(oidcAuthService, 'getUserRoles').and.returnValue(['HRAdmin']);
    spyOn(mockPermissionsService, 'loadPermissions');
    spyOn(mockRolesService, 'flushRoles');
    spyOn(mockRolesService, 'addRoles');

    startup.setPermissions();

    expect(mockPermissionsService.loadPermissions).toHaveBeenCalledWith(permissions);
    expect(mockRolesService.flushRoles).toHaveBeenCalled();
    expect(mockRolesService.addRoles).toHaveBeenCalledWith({ HRAdmin: permissions });
  });

  it('should set read-only permissions for anonymous user', () => {
    spyOn(oidcAuthService, 'getUserRoles').and.returnValue([]);
    spyOn(mockPermissionsService, 'loadPermissions');
    spyOn(mockRolesService, 'flushRoles');
    spyOn(mockRolesService, 'addRoles');

    startup.setPermissions();

    expect(mockPermissionsService.loadPermissions).toHaveBeenCalledWith(['canRead']);
    expect(mockRolesService.flushRoles).toHaveBeenCalled();
    expect(mockRolesService.addRoles).toHaveBeenCalledWith({ Guest: ['canRead'] });
  });
});
