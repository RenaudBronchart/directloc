// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AppShellComponent } from './layout/app-shell/app-shell.component';
import { AuthGuard } from './guards/auth-guard';
import { NoAuthGuard } from './guards/no-auth.guard';

/**
 * App route map.
 *
 * Notes:
 * - Public auth routes are protected with NoAuthGuard (redirect if already signed in).
 * - Everything inside the shell uses the common layout (header/footer + router-outlet).
 * - Bookings detail, messaging, profile and owner pages are protected by AuthGuard.
 */
export const routes: Routes = [
  /* ===== Public: auth ===== */
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

  /* ===== Shell (layout + outlet) ===== */
  {
    path: '',
    component: AppShellComponent,
    children: [
      // Home (public)
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/home/home.component').then(m => m.HomeComponent),
        data: { title: 'Home' }
      },
      { path: '', pathMatch: 'full', redirectTo: 'home' },

      /* --- Properties --- */
      // Create / edit require auth
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
      // Detail + list are public
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

      /* --- My properties (owner) --- */
      {
        path: 'my-properties',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./pages/property/my-properties/my-properties.component')
            .then(m => m.MyPropertiesComponent),
        data: { title: 'My properties' }
      },

      /* --- Bookings --- */
      // Single booking detail (protected)
      {
        path: 'bookings/:id',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./pages/booking/booking-detail.component')
            .then(m => m.BookingDetailComponent),
        data: { title: 'Booking detail' }
      },
      // If you later add a dedicated "My bookings" page, uncomment below:
      // {
      //   path: 'my-bookings',
      //   canActivate: [AuthGuard],
      //   loadComponent: () =>
      //     import('./pages/booking/my-bookings/my-bookings.component')
      //       .then(m => m.MyBookingsComponent),
      //   data: { title: 'My bookings' }
      // },

      /* --- Messaging (protected) --- */
      {
        path: 'messages',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./pages/messaging/inbox/inbox.component')
            .then(m => m.InboxComponent),
        data: { title: 'Messages' }
      },
      {
        path: 'messages/:id',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./pages/messaging/thread/thread.component')
            .then(m => m.ThreadComponent),
        data: { title: 'Conversation' }
      },

      /* --- Profile (protected) --- */
      {
        path: 'profile',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./pages/profile/profile.component')
            .then(m => m.ProfileComponent),
        data: { title: 'My profile' }
      },
      /* --- onboarding --- */
      {
        path: 'onboarding',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./pages/onboarding/onboarding.component')
            .then(m => m.OnboardingComponent),
        data: { title: 'onboarding' }
      },



    ]
  },

  /* ===== 404 ===== */
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent),
    data: { title: 'Not found' }
  }
];
