import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent implements OnInit {
  title = 'prueba2';

  constructor(private router: Router) {}

  ngOnInit() {
    const isModalShown = localStorage.getItem('modalShown');
    if (!isModalShown) {
      this.router.navigate(['/bienvenido']);  // Redirige a la bienvenida si no se ha mostrado
    }
  }
}
