import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard';

export const routes: Routes = [
  // Redirect to login by default
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Public route – Login page
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent)
  },

  // Public route – Register page
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.component').then(m => m.RegisterComponent)
  },

  // Protected route – Home
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then(m => m.HomeComponent),
    canActivate: [AuthGuard]
  },

  // Protected route – Create new property
  {
    path: 'properties/create',
    loadComponent: () =>
      import('./pages/property/property-create/property-create.component').then(m => m.PropertyCreateComponent),
    canActivate: [AuthGuard]
  },

  // Protected route – Edit existing property
  {
    path: 'properties/edit/:id',
    loadComponent: () =>
      import('./pages/property/property-edit/property-edit.component').then(m => m.PropertyEditComponent),
    canActivate: [AuthGuard]
  },

  // Public route – Property detail view
  {
    path: 'properties/:id',
    loadComponent: () =>
      import('./pages/property/property-detail/property-detail.component').then(m => m.PropertyDetailComponent)
  },

  // Public route – List of all properties
  {
    path: 'properties',
    loadComponent: () =>
      import('./pages/property/property-list/property-list.component').then(m => m.PropertyListComponent)
  },

  // Protected route – Logged-in user's properties
  {
    path: 'my-properties',
    loadComponent: () =>
      import('./pages/property/my-properties/my-properties.component').then(m => m.MyPropertiesComponent),
    canActivate: [AuthGuard]
  },

  // Wildcard route – Not found page
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
