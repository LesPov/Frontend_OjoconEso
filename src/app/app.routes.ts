import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { denunciasRoutes } from './components/denuncias/routers/denuncias.routes';
import { NgModule } from '@angular/core';

export const routes: Routes = [
    ...denunciasRoutes
];
@NgModule({
    imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
    exports: [RouterModule]
  })
  export class AppRoutingModule { }
  