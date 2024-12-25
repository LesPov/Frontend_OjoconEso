import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BiembenidoComponent } from '../bienvenido/bienvenido.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink, BiembenidoComponent],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent {
  currentModal: string | null = null;
  modalTitle: string = '';
  callUrl: string = '';
  navigateRoute: string = '';
  showWelcomeComponent: boolean = true; // Configura según tu lógica

  constructor(private router: Router,
    private toastr: ToastrService,
  ) { }

  openModal(title: string, callUrl: string, route: string): void {
    this.currentModal = title;
    this.modalTitle = title;
    this.callUrl = callUrl;
    this.navigateRoute = route;
  }
  showwarnig(): void {
    this.toastr.warning('En próximas actualizaciones se agregará.', 'Warning');
  }
  closeModal(): void {
    this.currentModal = null;
  }

  makeCall(): void {
    window.location.href = this.callUrl;
  }

  navigateToRoute(): void {
    if (this.navigateRoute) {
      this.router.navigate([this.navigateRoute]);
    } else {
      this.toastr.error('No se pudo navegar. Ruta no definida.', 'Error');
    }
  }

}