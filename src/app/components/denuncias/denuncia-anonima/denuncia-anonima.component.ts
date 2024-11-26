import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from './layout/header/header.component';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BotInfoService } from '../shared/bot/botInfoDenuncias';

@Component({
  selector: 'app-denuncia-anonima',
  standalone: true,
  imports: [FormsModule, CommonModule, HeaderComponent],
  templateUrl: './denuncia-anonima.component.html',
  styleUrls: ['./denuncia-anonima.component.css']
})
export class DenunciaAnonimaComponent implements OnInit {
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.handleScrollUpVisibility();
  }
  
  public infoListAnonima: string[] = [
    "Como denunciar anonimamente",
    "En esta sección puedes realizar denuncias de forma anónima. Recuerda que una denuncia anónima te permite reportar situaciones sin revelar tu identidad, protegiendo así tu seguridad.",
    "Te guiaremos paso a paso en el proceso para que puedas completar toda la información necesaria.",
    "Recuerda que el proceso incluye varias etapas, como seleccionar el tipo de denuncia, agregar evidencias, indicar la ubicación del incidente, entre otras.",
  ];

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private botInfoService: BotInfoService
  ) { }
  
  showwarnig(): void {
    this.toastr.warning('En próximas actualizaciones se agregará.', 'Warning');
  }

  ngOnInit(): void {
    this.botInfoService.setInfoList(this.infoListAnonima);
    this.botInfoService.getScrollIndex().subscribe(index => {
      this.scrollToParagraph(index);
    });
  }

  scrollToParagraph(index: number): void {
    const paragraphs = document.querySelectorAll('p');
    if (paragraphs[index]) {
      paragraphs[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  goToConsulta() {
    this.router.navigate(['/consulta']);
  }

  goToCrear() {
    this.router.navigate(['/tipos_de_denuncia']);
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
    }, 16); // Tiempo en milisegundos (16 ms para lograr 60fps)
  }
}
