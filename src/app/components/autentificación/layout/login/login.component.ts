import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { HeaderAuthComponent } from '../header-auth/header-auth.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Userauths } from '../../interfaces/auths';
import { AuthsService } from '../../services/auths';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * @class LoginComponent
 * @implements OnInit
 * @description Este componente maneja la funcionalidad de inicio de sesión del usuario.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [HeaderAuthComponent, CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  /**
   * @property {string} navigateRoute - La ruta a la que se navega después del inicio de sesión.
   */
  navigateRoute: string = '';

  /**
   * @property {Userauths} user - El objeto usuario que contiene el nombre de usuario y la contraseña o contraseña aleatoria.
   */
  user: Userauths = {
    username: '',
    passwordorrandomPassword: '', // Permite el uso de contraseña o contraseña aleatoria
  };

  /**
   * @property {any} username - El nombre de usuario del usuario.
   */
  username: any;

  /**
   * @constructor
   * @param {ToastrService} toastr - Servicio para mostrar notificaciones tipo toast.
   * @param {AuthsService} authsService - Servicio para manejar la autenticación.
   * @param {Router} router - Servicio de enrutamiento para navegar entre rutas.
   * @param {ActivatedRoute} route - Ruta activada para acceder a los parámetros de la ruta.
   */
  constructor(
    private toastr: ToastrService,
    private authsService: AuthsService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  /**
   * @method ngOnInit
   * @description Hook del ciclo de vida que se llama después de que las propiedades enlazadas a datos de una directiva se inicializan.
   * Inicializa el componente.
   * @returns {void}
   */
  ngOnInit(): void { }

  /**
   * @method loginUser
   * @description Maneja el proceso de inicio de sesión del usuario. Valida la entrada del usuario, llama al servicio de autenticación
   * y navega a la ruta apropiada según la respuesta.
   * @returns {void}
   */
  loginUser() {
    // Validar que el usuario haya ingresado valores
    if (!this.user.username || !this.user.passwordorrandomPassword) {
      this.toastr.error('Todos los campos son obligatorios', 'Error');
      return;
    }

    // Llamar al servicio de autenticación para iniciar sesión
    this.authsService.login(this.user).subscribe(
      (response) => {
        // Si la respuesta contiene un token
        if (response.token) {
          this.toastr.success(`Bienvenido, ${this.user.username}!`);

          // Almacenar el token y el userId en localStorage
          localStorage.setItem('token', response.token);
          if (response.userId) {
            localStorage.setItem('userId', response.userId);
          }

          // Navegar según el rol del usuario
          if (response.rol === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            // Si la contraseña es aleatoria, navegar a la página de cambio de contraseña
            if (response.passwordorrandomPassword === 'randomPassword') {
              this.router.navigate(['login/change-password'], { queryParams: { username: this.user.username } });
            } else {
              // Si no, navegar a la página de trabajador
              this.router.navigate(['/worker']);
            }
          }
        }
      },
      (error: HttpErrorResponse) => {
        // Mostrar un mensaje de error si la autenticación falla
        this.toastr.error(error.error.msg, 'Error');
      }
    );
  }
}
