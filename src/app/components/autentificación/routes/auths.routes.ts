import { Routes } from '@angular/router';

export const authenticationRoutes: Routes = [
    { path: 'login/passwordrecovery', loadComponent: () => import('../layout/login/passwordrecovery/passwordrecovery.component').then(m => m.PasswordrecoveryComponent) },
    { path: 'login', loadComponent: () => import('../layout/login/login.component').then(m => m.LoginComponent) },
    { path: 'register', loadComponent: () => import('../layout/register/register.component').then(m => m.RegisterComponent) },

];