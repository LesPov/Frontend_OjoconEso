import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from './header/header.component';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-denuncia-anonima',
  standalone: true,
  imports: [FormsModule, CommonModule, HeaderComponent],
  templateUrl: './denuncia-anonima.component.html',
  styleUrl: './denuncia-anonima.component.css'
})
export class DenunciaAnonimaComponent implements OnInit {
  claveUnica: string = '';  // Variable para almacenar la clave ingresada
  error: string | null = null;

  constructor(private router: Router,  private toastr: ToastrService) { }

  ngOnInit(): void { }
// Método para navegar a la ruta de consulta
goToConsulta() {
  this.router.navigate(['/consultar']);
}
  // Método para navegar a la ruta de Crear
  goToCrear() {
    this.router.navigate(['/tipos']);
  }
}