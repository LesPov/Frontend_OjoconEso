import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from './header/header.component';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BotInfoService } from '../shared/bot/botInfoDenuncias';

@Component({
  selector: 'app-denuncia-anonima',
  standalone: true,
  imports: [FormsModule, CommonModule, HeaderComponent],
  templateUrl: './denuncia-anonima.component.html',
  styleUrl: './denuncia-anonima.component.css'
})
export class DenunciaAnonimaComponent implements OnInit {

  public infoListAnonima: string[] = [
    "Bienvenido alimalaha ",
    "En esta sección podrás realizar denuncias anónimas. Recuerda que una denuncia anónima permite reportar situaciones sin necesidad de revelar tu identidad, protegiendo tu seguridad.",
    "Te guiaremos paso a paso en el proceso para que puedas completar toda la información necesaria.",
    "Recuerda que el proceso tiene varias etapas como el tipo de denuncia, evidencias, dirección delincidente,entre otras.",
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
}
