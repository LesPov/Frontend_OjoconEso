import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DenunciaAnonimaInterface } from '../../interface/denunciaAnonimaInterface';
import { BotInfoService } from '../../../shared/bot/botInfoDenuncias';
import { FooterComponent } from '../../footer/footer.component';
import { HeaderComponent } from '../../header/header.component';
import { DenunciasService } from '../../service/denuncias.service';
import { DenunciaStorageService } from '../../service/denunciaStorage.service';


@Component({
  selector: 'app-resumen',
  standalone: true,
  imports: [FormsModule, CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './resumen.component.html',
  styleUrls: ['./resumen.component.css']
})
export class ResumenComponent implements OnInit {
  currentStep = 3;
  totalSteps = 3;
  datosResumen: Partial<DenunciaAnonimaInterface> = {};
  claveUnica: string | null = null; 
  showModal: boolean = false; 

  // Mensajes de ayuda para el resumen
  private inforesumen: string[] = [
    "Estás en la sección de resumen de tu denuncia.",
    "Revisa cuidadosamente la información antes de proceder.",
    "Si es necesario, puedes volver atrás para corregir la información.",
    "Guarda la clave de radicado una vez que envíes la denuncia, será necesaria para futuras consultas."
  ];
  constructor(
    private denunciaStorageService: DenunciaStorageService,
    private botInfoService: BotInfoService,
    private denunciasService: DenunciasService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.datosResumen = this.denunciaStorageService.getDenuncia();

    // Validar si faltan datos y redirigir a /tipos si es necesario
    if (
      !this.datosResumen.nombreTipo ||
      !this.datosResumen.nombreSubtipo ||
      !this.datosResumen.descripcion ||
      !this.datosResumen.direccion
    ) {
      // Redirigir a /tipos si faltan datos en el resumen
      this.router.navigate(['/tipos']);
    }
    this.botInfoService.setInfoList(this.inforesumen);
  }

  // Verificar si el botón "Continuar" debe estar habilitado
  isContinueButtonEnabled(): boolean {
    return !!(
      this.datosResumen.nombreTipo &&
      this.datosResumen.nombreSubtipo &&
      this.datosResumen.descripcion &&
      this.datosResumen.direccion
    );
  }

  // Manejar el clic en el botón "Continuar"
  handleContinue(): void {
    if (this.isContinueButtonEnabled()) {
      // Lógica para enviar la denuncia al backend
      this.denunciasService
        .crearDenunciaAnonima(this.datosResumen as DenunciaAnonimaInterface)
        .subscribe({
          next: (response) => {
            console.log('Denuncia creada:', response);
            this.claveUnica = response.nuevaDenuncia.claveUnica; // Capturar la clave única desde la respuesta
            this.showModal = true; // Mostrar el modal de éxito
          },
          error: (error) => {
            console.error('Error al crear la denuncia:', error);
          },
        });
    }
  }

  // Función para cerrar el modal y redirigir a la página de éxito
  closeModal(): void {
    this.showModal = false;
    this.denunciaStorageService.resetDenuncia(); // Limpiar los datos después de cerrar el modal
    this.router.navigate(['/exito']); // Redirigir a una página de éxito
  }
}
