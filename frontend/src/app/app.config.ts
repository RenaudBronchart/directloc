import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { authInterceptor } from './interceptors/auth-interceptor';

// Opcional: si el interceptor usa MatSnackBar, asegúrate de proveerlo aquí
import { MatSnackBarModule } from '@angular/material/snack-bar';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),                          // usa uno u otro, NO provideAnimationsAsync
    importProvidersFrom(MatSnackBarModule),       // necesario si usas snack en el interceptor
  ],
};
