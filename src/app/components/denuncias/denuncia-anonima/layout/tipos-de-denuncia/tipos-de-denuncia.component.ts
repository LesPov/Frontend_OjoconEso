import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BotInfoService } from '../../../shared/bot/botInfoDenuncias';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { TipoDenunciaInterface } from '../../interface/tipoDenunciaInterface';
import { DenunciasService } from '../../service/denuncias/denuncias.service';
import { DenunciaStorageService } from '../../service/denuncias/denunciaStorage.service';
import { environment } from '../../../../../../environments/environment';


@Component({
  selector: 'app-tipos-de-denuncia',
  standalone: true,
  imports: [FormsModule, CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './tipos-de-denuncia.component.html',
  styleUrl: './tipos-de-denuncia.component.css'
})
export class TiposDeDenunciaComponent implements OnInit {
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.handleScrollUpVisibility();
  }
  tiposDenunciasAnonimas: TipoDenunciaInterface[] = [];
  descripcionVisible: number | null = null;
  selectedDenunciaIndex: number | null = null;
  isSpeaking: boolean = false;
  speakingIndex: number | null = null;
  pulsingStates: boolean[] = [];
  denunciaSelected: boolean = false;  // Flag to track if a denuncia is selected
  tipoDenuncia: string | null = null;  // Guardar el tipo de denuncia


  private infoListAnonima: string[] = [
    "Estás en la sección de denuncias anónimas. Aquí puedes reportar sin revelar tu identidad.",
    "Estos son los tipos de denuncias que tenemos disponibles. Selecciona una para obtener más detalles.",
    "Haz clic en la imagen de cualquier denuncia para consultar más información sobre ella.",
    "Si deseas hacer seguimiento de tu denuncia, recibirás un código al finalizar.",
    "Para obtener acceso a funciones avanzadas como usar la inteligencia artificial, regístrate y comienza sesión."
  ];


  constructor(
    private denunciasService: DenunciasService,
    private router: Router,
    private toastr: ToastrService,
    private botInfoService: BotInfoService,
    private denunciaStorage: DenunciaStorageService

  ) { }

  ngOnInit(): void {
    this.obtenerTiposDenunciaAnonimas();
    this.botInfoService.setInfoList(this.infoListAnonima);
  }

  obtenerTiposDenunciaAnonimas(): void {
    this.denunciasService.getTiposDenunciaAnonimas().subscribe({
      next: (tipos) => {
        this.tiposDenunciasAnonimas = tipos;
        this.pulsingStates = new Array(tipos.length).fill(true);
      },
      error: (err) => {
        this.toastr.error('Error al obtener las denuncias anónimas', 'Error');
        console.error(err);
      }
    });
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

 
  speakDenuncia(index: number): void {
    if (this.isSpeaking && this.speakingIndex === index) {
      return;
    }

    const denuncia = this.getDenuncia(index);
    if (denuncia) {
      this.startSpeaking(index, denuncia);
    }
  }

  private getDenuncia(index: number): TipoDenunciaInterface | null {
    return this.tiposDenunciasAnonimas[index] || null;
  }

  private startSpeaking(index: number, denuncia: TipoDenunciaInterface): void {
    const name = denuncia.nombre;
    const description = denuncia.descripcion || 'No hay descripción disponible';

    this.botInfoService.cancelSpeak();
    this.isSpeaking = true;
    this.speakingIndex = index;
    this.stopPulse(index);

    this.botInfoService.speak(name);
    this.botInfoService.speak(description)
      .then(() => this.resetSpeakingState())
      .catch((error) => {
        console.error('Error al hablar:', error);
        this.resetSpeakingState();
      });
  }

  private resetSpeakingState(): void {
    this.isSpeaking = false;
    this.speakingIndex = null;
  }


  getImageUrl(flagImage: string): string {
    if (!flagImage) {
      return '../../../../../../assets/img/default-denuncia.png'; // Imagen por defecto
    }
    return `${environment.endpoint}uploads/tipoDenuncias/tipo/${flagImage}`;
  }

  handleContinue(): void {
    if (this.selectedDenunciaIndex === null) {
      this.toastr.error('Por favor, selecciona una denuncia para continuar.', 'Error');
      return;
    }

    const selectedDenuncia = this.tiposDenunciasAnonimas[this.selectedDenunciaIndex];
    if (selectedDenuncia) {
      // Guardar en el storage
      this.denunciaStorage.setTipoDenuncia(selectedDenuncia.nombre);
      // Navegar
      this.router.navigate(['../subtipos_de_denuncia', { nombreTipoDenuncia: selectedDenuncia.nombre }]);
    }
  }


  stopPulse(index: number): void {
    this.pulsingStates[index] = false;
  }

  isPulsing(index: number): boolean {
    return this.pulsingStates[index];
  }

  private handleScrollUpVisibility(): void {
    const scrollUpElement = document.getElementById('scroll-up');
    if (scrollUpElement) {
      if (window.scrollY >= 560) {
        scrollUpElement.classList.add('show-scroll');
        scrollUpElement.classList.remove('scrollup--inactive');
      } else {
        scrollUpElement.classList.remove('show-scroll');
        scrollUpElement.classList.add('scrollup--inactive');
      }
    }
  }

  scrollToTop(): void {
    const scrollStep = -window.scrollY / 20; // Ajusta este número para modificar la velocidad de desplazamiento
    const scrollInterval = setInterval(() => {
      if (window.scrollY !== 0) {
        window.scrollBy(0, scrollStep);
      } else {
        clearInterval(scrollInterval);
        // Ocultar el botón cuando llegues a la parte superior
        const scrollUpElement = document.getElementById('scroll-up');
        if (scrollUpElement) {
          scrollUpElement.classList.add('scrollup--inactive');
        }
      }
    }, 20); // Tiempo en milisegundos (16 ms para lograr 60fps)
  }
}