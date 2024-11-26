import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { HeaderAuthComponent } from '../header-auth/header-auth.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Userauths } from '../../interfaces/auths';
import { AuthsService } from '../../services/auths';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [HeaderAuthComponent, CommonModule,FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  user: Userauths = {
    username: '',
    passwordorrandomPassword: '', // Cambiado para permitir el uso de contraseña o contraseña aleatoria
  };
  username: any;

  constructor(
    private toastr: ToastrService,
    private authsService: AuthsService,
    private router: Router,
    private route: ActivatedRoute // Agrega esta línea
  ) { }


  ngOnInit(): void { }

  loginUser() {
    // Validamos que el usuario ingrese valores
    if (!this.user.username || !this.user.passwordorrandomPassword) {
      this.toastr.error('Todos los campos son obligatorios', 'Error');
      return;
    }

    this.authsService.login(this.user).subscribe(
      (response) => {
        if (response.token) {
          this.toastr.success(`Bienvenido, ${this.user.username}!`);

          // Almacenar token y userId en localStorage
          localStorage.setItem('token', response.token);
          if (response.userId) {
            localStorage.setItem('userId', response.userId);
          }
          if (response.rol === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            if (response.passwordorrandomPassword === 'randomPassword') {
              this.router.navigate(['login/change-password'], { queryParams: { username: this.user.username } });
            } else {
              this.router.navigate(['/worker']);
            }

          }
        }
      },
      (error: HttpErrorResponse) => {
        this.toastr.error(error.error.msg, 'Error');
      }
    );
  }
} 