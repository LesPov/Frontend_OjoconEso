import { Routes } from '@angular/router';

export const anonimoRoutes: Routes = [
  {
    path: 'anonima',
    loadComponent: () => import('../denuncia-anonima.component').then(m => m.DenunciaAnonimaComponent),
  },
  {
    path: 'consulta',
    loadComponent: () => import('../layaut/consulta/consulta.component').then(m => m.ConsultaComponent),
  },
  {
    path: 'tipos_de_denuncia',
    loadComponent: () => import('../layaut/tipos-de-denuncia/tipos-de-denuncia.component').then(m => m.TiposDeDenunciaComponent),
  },
  {
    path: 'subtipos_de_denuncia',
    loadComponent: () => import('../layaut/subtipos-de-denuncia/subtipos-de-denuncia.component').then(m => m.SubtiposDeDenunciaComponent),
  },
  {
    path: 'evidencia',
    loadComponent: () => import('../layaut/evidencia/evidencia.component').then(m => m.EvidenciaComponent),
  },
  {
    path: 'ubicacion',
    loadComponent: () => import('../layaut/ubicacion/ubicacion.component').then(m => m.UbicacionComponent),
  },
  {
    path: 'resumen_de_denunacia_anonima',
    loadComponent: () => import('../layaut/resumen/resumen.component').then(m => m.ResumenComponent),
  },
];