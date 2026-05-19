import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from '@interceptors';

/**
 * Configuration de l'application standalone Angular.
 * Centralise tous les "providers" globaux (router, HttpClient, intercepteurs).
 * Utilisé par main.ts via bootstrapApplication().
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
