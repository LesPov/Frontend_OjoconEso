import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DenunciaAnonimaInterface } from '../../interface/denunciaAnonimaInterface';
import { BotInfoService } from '../../../shared/bot/botInfoDenuncias';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { DenunciasService } from '../../service/denuncias/denuncias.service';
import { DenunciaStorageService } from '../../service/denuncias/denunciaStorage.service';
import { ToastrService } from 'ngx-toastr';

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
  // Campos para archivos
  pruebas: File[] = [];  // Imágenes o pruebas
  audios: File[] = [];   // Audios

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
    private router: Router,
    private toastr: ToastrService
  ) { }


  ngOnInit(): void {
    this.datosResumen = this.denunciaStorageService.getDenuncia();
    // Get the files from storage
    this.pruebas = this.denunciaStorageService.getPruebasFiles();
    this.audios = this.denunciaStorageService.getAudioFiles();

    console.log("Archivos de pruebas cargados:", this.pruebas);
    console.log("Archivos de audio cargados:", this.audios);

    // Validar si faltan datos y redirigir a /tipos si es necesario
    if (
      !this.datosResumen.nombreTipo ||
      !this.datosResumen.nombreSubtipo ||
      !this.datosResumen.descripcion ||
      !this.datosResumen.direccion
    ) {
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
      // Use the files stored in the component
      console.log("Enviando archivos de pruebas:", this.pruebas);
      console.log("Enviando archivos de audio:", this.audios);

      this.denunciasService
        .crearDenunciaAnonima(
          this.datosResumen as DenunciaAnonimaInterface,
          this.pruebas,
          this.audios
        )
        .subscribe({
          next: (response) => {
            console.log('Denuncia creada:', response);
            this.claveUnica = response.nuevaDenuncia.claveUnica;
            this.showModal = true;
          },
          error: (error) => {
            console.error('Error al crear la denuncia:', error);
            this.toastr.error('Error al crear la denuncia', 'Error');
          },
        });
    }
  }



  // Función para manejar el cambio en los archivos de pruebas
  onFileChange(event: any): void {
    const files = event.target.files;
    this.pruebas = Array.from(files);  // Asigna los archivos seleccionados a la variable 'pruebas'
    console.log("Archivos de pruebas:", this.pruebas);
  }

  // Función para manejar el cambio en los archivos de audio
  onAudioChange(event: any): void {
    const files = event.target.files;
    this.audios = Array.from(files);  // Asigna los archivos seleccionados a la variable 'audios'
    console.log("Archivos de audio:", this.audios);
  }


  copiarClave(): void {
    if (this.claveUnica) {
      navigator.clipboard.writeText(this.claveUnica).then(() => {
        this.toastr.success("Clave copiada al portapapeles", "Éxito");
      }).catch(err => {
        console.error("Error al copiar la clave", err);
      });
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.denunciaStorageService.resetDenuncia(); // Limpiar los datos después de cerrar el modal
    this.router.navigate(['/exito']); // Redirigir a una página de éxito
  }
}
