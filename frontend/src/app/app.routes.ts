import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [

  // 🔓 Public route – Redirect root to login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // 🔓 Public route – Login page (no layout)
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent)
  },

  // 🔓 Public route – Register page (no layout)
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.component').then(m => m.RegisterComponent)
  },

  // 🧱 Layout wrapper – contains all main pages with header/footer
  {
    path: '',
    component: LayoutComponent,
    children: [
      // 🔐 Protected route – Home dashboard
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/home/home.component').then(m => m.HomeComponent),
        canActivate: [AuthGuard]
      },

      // 🔐 Protected route – Create a new property
      {
        path: 'properties/create',
        loadComponent: () =>
          import('./pages/property/property-create/property-create.component').then(m => m.PropertyCreateComponent),
        canActivate: [AuthGuard]
      },

      // 🔐 Protected route – Edit an existing property
      {
        path: 'properties/edit/:id',
        loadComponent: () =>
          import('./pages/property/property-edit/property-edit.component').then(m => m.PropertyEditComponent),
        canActivate: [AuthGuard]
      },

      // 🔓 Public route – View single property detail
      {
        path: 'properties/:id',
        loadComponent: () =>
          import('./pages/property/property-detail/property-detail.component').then(m => m.PropertyDetailComponent)
      },

      // 🔓 Public route – List all available properties
      {
        path: 'properties',
        loadComponent: () =>
          import('./pages/property/property-list/property-list.component').then(m => m.PropertyListComponent)
      },

      // 🔐 Protected route – User's own properties
      {
        path: 'my-properties',
        loadComponent: () =>
          import('./pages/property/my-properties/my-properties.component').then(m => m.MyPropertiesComponent),
        canActivate: [AuthGuard]
      }
    ]
  },

  // 🌐 Fallback route – Not found page
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
