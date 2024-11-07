// consulta.component.ts
import { Component } from '@angular/core';
import { ConsultaDenunciaResponse } from '../../interface/consultasDenunciasAnonimasInterface';
import { DenunciasService } from '../../service/denuncias.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-consulta',
  standalone: true,
  imports: [FormsModule, CommonModule, HeaderComponent],
  templateUrl: './consulta.component.html',
  styleUrls: ['./consulta.component.css']
})
export class ConsultaComponent {
  claveUnica: string = '';
  denuncia: any = null;
  error: string = '';

  constructor(private denunciasService: DenunciasService) { }

  consultarDenuncia() {
    this.denuncia = null;
    this.error = '';

    this.denunciasService.consultarDenunciaAnonima(this.claveUnica)
      .subscribe(
        (response: ConsultaDenunciaResponse) => {
          this.denuncia = response.denuncia;
          if (typeof this.denuncia.pruebas === 'string') {
            this.denuncia.pruebas = [this.denuncia.pruebas];
          }
        },
        (error) => {
          this.denuncia = null;
          this.error = error.error.error;
        }
      );
  }
}
