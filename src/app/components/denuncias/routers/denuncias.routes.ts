import { Routes } from '@angular/router';
import { anonimoRoutes } from '../denuncia-anonima/routers/anonima.routes';

export const denunciasRoutes: Routes = [
    ...anonimoRoutes,
    { path: 'bienvenida', loadComponent: () => import('../shared/bienvenido/biembenido.component').then(m => m.BiembenidoComponent) },
    { path: 'inicio', loadComponent: () => import('../shared/inicio/inicio.component').then(m => m.InicioComponent) },
    { path: '', redirectTo: '/bienvenida', pathMatch: 'full' },
    { path: '**', redirectTo: '/bienvenida' },

];