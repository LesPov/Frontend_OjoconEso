import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BotInfoService } from '../../../shared/bot/botInfoDenuncias';
import { FooterComponent } from '../../footer/footer.component';
import { HeaderComponent } from '../../header/header.component';
import { SubtipoDenunciaInterface } from '../../interface/subtipoDenunciaInterface';
import { DenunciasService } from '../../service/denuncias.service';
import { DenunciaStorageService } from '../../service/denunciaStorage.service';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-subtipos-de-denuncia',
  standalone: true,
  imports: [FormsModule, CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './subtipos-de-denuncia.component.html',
  styleUrl: './subtipos-de-denuncia.component.css'
})
export class SubtiposDeDenunciaComponent implements OnInit {
  subtipos: SubtipoDenunciaInterface[] = [];
  tipoDenuncia: string | null = null;
  isSpeaking: boolean = false;
  speakingIndex: number | null = null;
  pulsingStates: boolean[] = [];
  descripcionVisible: number | null = null;
  selectedDenunciaIndex: number | null = null;
  denunciaSelected: boolean = false;  // Flag to track if a denuncia is selected

  private infosubtiposlist: string[] = [
    "Has llegado a la sección de subtipos de denuncia. Aquí puedes afinar más tu elección.",
    "Selecciona un subtipo de denuncia que represente mejor el incidente que quieres reportar.",
    "Haz clic en la imagen del subtipo para escuchar más detalles sobre la opción seleccionada.",
    "Recuerda que tu elección de subtipo ayudará a clasificar mejor tu denuncia para una respuesta más adecuada.",
    "Si tienes alguna duda, no dudes en hacer clic en el ícono de información para recibir más ayuda.",
    "Gracias por seguir este proceso. Cada denuncia ayuda a mejorar la seguridad de todos."
  ];
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private denunciasService: DenunciasService,
    private toastr: ToastrService,
    private botInfoService: BotInfoService,
    private denunciaStorage: DenunciaStorageService
  ) { }
  ngOnInit(): void {
    // Obtener el nombre del tipo de denuncia de los parámetros de la ruta
    this.route.params.subscribe(params => {
      this.tipoDenuncia = params['nombreTipoDenuncia'];
      this.obtenerSubtipos(this.tipoDenuncia);
    });
    this.botInfoService.setInfoList(this.infosubtiposlist);
  }

  obtenerSubtipos(nombreTipoDenuncia: string | null): void {
    if (nombreTipoDenuncia) {
      this.denunciasService.getSubtiposDenuncia(nombreTipoDenuncia).subscribe({
        next: (response) => {
          this.subtipos = response.subtipos;
          this.pulsingStates = new Array(this.subtipos.length).fill(true);
        },
        error: (err) => {
          this.toastr.error('Error al obtener los subtipos de denuncia', 'Error');
          console.error(err);
        }
      });
    }
  }


  toggleDescripcion(index: number): void {
    this.descripcionVisible = this.descripcionVisible === index ? null : index;
    this.stopPulse(index);
  }
  selectDenuncia(index: number): void {
    this.selectedDenunciaIndex = this.selectedDenunciaIndex === index ? null : index;
    this.denunciaSelected = this.selectedDenunciaIndex !== null;  // Set the flag based on selection
    this.stopPulse(index);
  }
  getImageUrl(flagImage: string): string {
    if (!flagImage) {
      return '../../../../../../assets/img/default-denuncia.png'; // Imagen por defecto
    }
    return `${environment.endpoint}uploads/${flagImage}`;
  }


  speakDenuncia(index: number): void {
    if (this.isSpeaking && this.speakingIndex === index) {
      return;
    }

    const subtipo = this.subtipos[index];
    if (subtipo) {
      const name = subtipo.nombre;
      const description = subtipo.descripcion || 'No hay descripción disponible';

      this.botInfoService.cancelSpeak();

      this.isSpeaking = true;
      this.speakingIndex = index;
      this.stopPulse(index);

      this.botInfoService.speak(name)
        .then(() => this.botInfoService.speak(description))
        .then(() => {
          this.isSpeaking = false;
          this.speakingIndex = null;
        })
        .catch((error) => {
          console.error('Error al hablar:', error);
          this.isSpeaking = false;
          this.speakingIndex = null;
        });
    }
  }

  handleContinue(): void {
    if (this.selectedDenunciaIndex === null) {
      this.toastr.error('Por favor, selecciona una denuncia para continuar.', 'Error');
      return;
    }

    // Obtener el nombre del tipo de denuncia seleccionado
    const selectedDenuncia = this.subtipos[this.selectedDenunciaIndex];
    if (selectedDenuncia) {
      // Guardar en el storage
      this.denunciaStorage.setSubtipoDenuncia(selectedDenuncia.nombre);
      // Navegar      
      this.router.navigate(['/evidencia', { nombreSubTipoDenuncia: selectedDenuncia.nombre }]);


    }
  }

  stopPulse(index: number): void {
    this.pulsingStates[index] = false;
  }

  isPulsing(index: number): boolean {
    return this.pulsingStates[index];
  }
}
