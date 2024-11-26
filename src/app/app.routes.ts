import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { denunciasRoutes } from './components/denuncias/routers/denuncias.routes';
import { NgModule } from '@angular/core';
import { authenticationRoutes } from './components/autentificación/routes/auths.routes';

export const routes: Routes = [
    ...authenticationRoutes,
    ...denunciasRoutes
];
@NgModule({
    imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
    exports: [RouterModule]
  })
  export class AppRoutingModule { }
  