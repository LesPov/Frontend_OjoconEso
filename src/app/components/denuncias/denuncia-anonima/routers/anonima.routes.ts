import { Routes } from '@angular/router';

export const anonimoRoutes: Routes = [
  {
    path: 'anonima',
    loadComponent: () => import('../denuncia-anonima.component').then(m => m.DenunciaAnonimaComponent),
  },

];