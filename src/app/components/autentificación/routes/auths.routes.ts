import { Routes } from '@angular/router';

export const authenticationRoutes: Routes = [
  
    { path: 'login', loadComponent: () => import('../layout/login/login.component').then(m => m.LoginComponent) },

];