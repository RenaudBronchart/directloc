import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  // 🔓 Public route – Login
  {
    path: 'login',
    loadComponent: () =>
        import('./pages/login/login.component').then(m => m.LoginComponent)
  },

  // 🔓 Public route – Register
  {
    path: 'register',
    loadComponent: () =>
        import('./pages/register/register.component').then(m => m.RegisterComponent)
  },

  // 🧱 Routes with layout (includes public + protected)
  {
    path: '',
    component: LayoutComponent,
    children: [
      // ✅ Home – libre (plus de AuthGuard ici)
      {
        path: 'home',
        loadComponent: () =>
            import('./pages/home/home.component').then(m => m.HomeComponent)
      },

      // ✅ Rediriger '' vers 'home'
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },

      // 🔐 Protected – Create Property
      {
        path: 'properties/create',
        loadComponent: () =>
            import('./pages/property/property-create/property-create.component').then(m => m.PropertyCreateComponent),
        canActivate: [AuthGuard]
      },

      // 🔐 Protected – Edit Property
      {
        path: 'properties/edit/:id',
        loadComponent: () =>
            import('./pages/property/property-edit/property-edit.component').then(m => m.PropertyEditComponent),
        canActivate: [AuthGuard]
      },

      // 🔓 Public – Property Detail
      {
        path: 'properties/:id',
        loadComponent: () =>
            import('./pages/property/property-detail/property-detail.component').then(m => m.PropertyDetailComponent)
      },

      // 🔓 Public – Property List
      {
        path: 'properties',
        loadComponent: () =>
            import('./pages/property/property-list/property-list.component').then(m => m.PropertyListComponent)
      },

      // 🔐 Protected – My Properties
      {
        path: 'my-properties',
        loadComponent: () =>
            import('./pages/property/my-properties/my-properties.component').then(m => m.MyPropertiesComponent),
        canActivate: [AuthGuard]
      }
    ]
  },

  // 🌐 Not found
  {
    path: '**',
    loadComponent: () =>
        import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
