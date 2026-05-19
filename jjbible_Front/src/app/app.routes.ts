import { Routes } from '@angular/router';
import { authGuard } from '@guards';

export const routes: Routes = [
  { path: '', redirectTo: 'techniques', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/pages/login/login.component').then(
        (m) => m.LoginComponent,
      ),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/pages/profile/profile.component').then(
        (m) => m.ProfileComponent,
      ),
  },
  {
    path: 'techniques',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/pages/techniques/techniques.component').then(
        (m) => m.TechniquesComponent,
      ),
  },
  {
    path: 'graph',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/pages/graph/graph.component').then(
        (m) => m.GraphComponent,
      ),
  },
  {
    path: 'users',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/pages/users-search/users-search.component').then(
        (m) => m.UsersSearchComponent,
      ),
  },
  {
    path: 'users/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/pages/user-profile/user-profile.component').then(
        (m) => m.UserProfileComponent,
      ),
  },
  { path: '**', redirectTo: 'techniques' },
];
