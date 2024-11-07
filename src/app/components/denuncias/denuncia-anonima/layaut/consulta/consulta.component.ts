import { Component } from '@angular/core';
import { ConsultaDenunciaResponse } from '../../interface/consultasDenunciasAnonimasInterface';
import { DenunciasService } from '../../service/denuncias.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { ToastrService } from 'ngx-toastr';

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

  constructor(
    private denunciasService: DenunciasService,
    private toastr: ToastrService
  ) {}

  consultarDenuncia() {
    this.denuncia = null;
    this.error = '';

    // Verificar si la clave está vacía
    if (!this.claveUnica.trim()) {
      this.toastr.error('Por favor, ingresa una clave de radicado', 'Clave requerida');
      return;
    }

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
          this.toastr.error('Clave incorrecta, por favor verifica', 'Error de consulta');
        }
      );
  }
}
