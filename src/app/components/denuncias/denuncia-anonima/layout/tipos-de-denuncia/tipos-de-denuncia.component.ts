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
  // Escucha el evento de desplazamiento de la ventana
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.handleScrollUpVisibility();
  }

  // Lista de tipos de denuncias anónimas
  tiposDenunciasAnonimas: TipoDenunciaInterface[] = [];
  // Índice de la descripción visible
  descripcionVisible: number | null = null;
  // Índice de la denuncia seleccionada
  selectedDenunciaIndex: number | null = null;
  // Indica si el bot está hablando
  isSpeaking: boolean = false;
  // Índice de la denuncia que se está hablando
  speakingIndex: number | null = null;
  // Estados de pulsación para cada denuncia
  pulsingStates: boolean[] = [];
  // Indica si una denuncia está seleccionada
  denunciaSelected: boolean = false;
  // Tipo de denuncia seleccionada
  tipoDenuncia: string | null = null;

  // Lista de información para el bot
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

  // Método que se ejecuta al inicializar el componente
  ngOnInit(): void {
    this.obtenerTiposDenunciaAnonimas();
    this.botInfoService.setInfoList(this.infoListAnonima);
  }

  // Obtiene los tipos de denuncias anónimas desde el servicio
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

  // Alterna la visibilidad de la descripción de una denuncia
  toggleDescripcion(index: number): void {
    this.descripcionVisible = this.descripcionVisible === index ? null : index;
    this.stopPulse(index);
  }

  // Selecciona una denuncia
  selectDenuncia(index: number): void {
    this.selectedDenunciaIndex = this.selectedDenunciaIndex === index ? null : index;
    this.denunciaSelected = this.selectedDenunciaIndex !== null;
    this.stopPulse(index);
  }

 /**
 * Habla la información de una denuncia.
 * @param index - El índice de la denuncia en la lista de tipos de denuncias anónimas.
 */
speakDenuncia(index: number): void {
  // Si el bot ya está hablando y el índice es el mismo, no hacer nada.
  if (this.isSpeaking && this.speakingIndex === index) {
    return;
  }

  // Obtener la denuncia correspondiente al índice.
  const denuncia = this.tiposDenunciasAnonimas[index];
  if (denuncia) {
    // Obtener el nombre y la descripción de la denuncia.
    const name = denuncia.nombre;
    const description = denuncia.descripcion || 'No hay descripción disponible';

    // Cancelar cualquier discurso en curso.
    this.botInfoService.cancelSpeak();

    // Indicar que el bot está hablando y establecer el índice de la denuncia que se está hablando.
    this.isSpeaking = true;
    this.speakingIndex = index;
    // Detener la pulsación de la denuncia.
    this.stopPulse(index);

    // Hablar el nombre de la denuncia.
    this.botInfoService.speak(name)
      .then(() => this.botInfoService.speak(description)) // Luego hablar la descripción.
      .then(() => {
        // Cuando termine de hablar, actualizar los estados.
        this.isSpeaking = false;
        this.speakingIndex = null;
      })
      .catch((error) => {
        // Manejar cualquier error que ocurra durante el discurso.
        console.error('Error al hablar:', error);
        this.isSpeaking = false;
        this.speakingIndex = null;
      });
  }
}
  // Obtiene la URL de la imagen de una denuncia
  getImageUrl(flagImage: string): string {
    if (!flagImage) {
      return '../../../../../../assets/img/default-denuncia.png'; // Imagen por defecto
    }
    return `${environment.endpoint}uploads/tipoDenuncias/tipo/${flagImage}`;
  }

  // Maneja la acción de continuar
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

  // Detiene la pulsación de una denuncia
  stopPulse(index: number): void {
    this.pulsingStates[index] = false;
  }

  // Verifica si una denuncia está pulsando
  isPulsing(index: number): boolean {
    return this.pulsingStates[index];
  }

  // Maneja la visibilidad del botón de desplazamiento hacia arriba
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

  // Desplaza la ventana hacia arriba
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