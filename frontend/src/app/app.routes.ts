// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AppShellComponent } from './layout/app-shell/app-shell.component';
import { AuthGuard } from './guards/auth-guard';
import { NoAuthGuard } from './guards/no-auth.guard';

export const routes: Routes = [
  // Public — Login /
  {
    path: 'login',
    canActivate: [NoAuthGuard],
    loadComponent: () =>
        import('./pages/login/login.component').then(m => m.LoginComponent),
    data: { title: 'Login' }
  },
  {
    path: 'register',
    canActivate: [NoAuthGuard],
    loadComponent: () =>
        import('./pages/register/register.component').then(m => m.RegisterComponent),
    data: { title: 'Register' }
  },

  // Shell: header + router-outlet + footer
  {
    path: '',
    component: AppShellComponent,
    children: [
      {
        path: 'home',
        loadComponent: () =>
            import('./pages/home/home.component').then(m => m.HomeComponent),
        data: { title: 'Home' }
      },
      { path: '', pathMatch: 'full', redirectTo: 'home' },

      // --- PROPERTIES
      {
        path: 'properties/create',
        canActivate: [AuthGuard],
        loadComponent: () =>
            import('./pages/property/property-create/property-create.component')
                .then(m => m.PropertyCreateComponent),
        data: { title: 'Create property' }
      },
      {
        path: 'properties/edit/:id',
        canActivate: [AuthGuard],
        loadComponent: () =>
            import('./pages/property/property-edit/property-edit.component')
                .then(m => m.PropertyEditComponent),
        data: { title: 'Edit property' }
      },
      {
        path: 'properties/:id',
        loadComponent: () =>
            import('./pages/property/property-detail/property-detail.component')
                .then(m => m.PropertyDetailComponent),
        data: { title: 'Property details' }
      },
      {
        path: 'properties',
        loadComponent: () =>
            import('./pages/property/property-list/property-list.component')
                .then(m => m.PropertyListComponent),
        data: { title: 'Explore stays' }
      },

      // My Properties (protégé)
      {
        path: 'my-properties',
        canActivate: [AuthGuard],
        loadComponent: () =>
            import('./pages/property/my-properties/my-properties.component')
                .then(m => m.MyPropertiesComponent),
        data: { title: 'My properties' }
      },
      {
        path: 'profile',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./pages/profile/profile.component').then(m => m.ProfileComponent),
        data: { title: 'My profile' }              //
      }
    ]
  },



  // Not found
  {
    path: '**',
    loadComponent: () =>
        import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent),
    data: { title: 'Not found' }
  }

];
