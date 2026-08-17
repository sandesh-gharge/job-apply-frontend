import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing';
import { LoginComponent } from './login/login';
import { HomeComponent } from './home/home';
import { authGuard } from './utils/guards/auth.guard';
import { AuthCallback } from './auth-callback/auth-callback';
import { SetPassword } from './set-password/set-password';

export const routes: Routes = [
  { path: '', component: LandingComponent, pathMatch: 'full' },
  { path: 'landing', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [authGuard], data: { roles: ['admin', 'user', 'guest'] } },
  { path: 'auth/callback', component: AuthCallback },
  { path: 'set-password', component: SetPassword, canActivate: [authGuard], data: { roles: ['admin', 'user', 'guest'] } },
  { path: '**', redirectTo: 'landing' }
];

