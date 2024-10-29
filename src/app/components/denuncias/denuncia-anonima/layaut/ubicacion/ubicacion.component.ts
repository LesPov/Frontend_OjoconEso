import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';
import * as L from 'leaflet';
import { ToastrService } from 'ngx-toastr';
import { BotInfoService } from '../../../shared/bot/botInfoDenuncias';
import { FooterComponent } from '../../footer/footer.component';
import { HeaderComponent } from '../../header/header.component';
import { DenunciaStorageService } from '../../service/denunciaStorage.service';

@Component({
  selector: 'app-ubicacion',
  standalone: true,
  imports: [FormsModule, CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './ubicacion.component.html',
  styleUrls: ['./ubicacion.component.css']
})
export class UbicacionComponent implements OnInit {
  currentStep = 2;
  totalSteps = 3;
  private map!: L.Map;
  private marker: L.Marker | null = null;
  selectedLocation: { lat: number; lng: number } | null = null;
  direccionSeleccionada: string = '';
  isLoading: boolean = false;

  // Lista de mensajes de ayuda
  private infoUbicacion: string[] = [
    "Bienvenido a la sección de selección de ubicación.",
    "Tu dispositivo intentará detectar tu ubicación automáticamente. Si no es posible, selecciona un punto en el mapa.",
    "Haz clic en el mapa para elegir el lugar donde ocurrió el incidente.",
    "Una vez que hayas seleccionado una ubicación, podrás continuar con el siguiente paso."
  ];

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private denunciaStorage: DenunciaStorageService,
    private botInfoService: BotInfoService


  ) { }

  ngOnInit() {
    this.requestUserLocation();
    // Asignar la nueva lista de mensajes al bot
    this.botInfoService.setInfoList(this.infoUbicacion);
  }
  private requestUserLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.initializeMap(latitude, longitude);  // Inicia el mapa con la ubicación actual
          this.handleMapClick({ latlng: { lat: latitude, lng: longitude } } as L.LeafletMouseEvent);
        },
        (error) => {
          this.toastr.error('No se pudo obtener la ubicación actual. Usa el mapa para seleccionar una ubicación.');
          this.initializeMap(4.6097, -74.0817);  // Coordenadas por defecto (Bogotá)
        }
      );
    } else {
      this.toastr.error('El dispositivo no soporta geolocalización. Usa el mapa para seleccionar una ubicación.');
      this.initializeMap(4.6097, -74.0817);  // Coordenadas por defecto (Bogotá)
    }
  }

  private initializeMap(lat: number, lng: number) {
    this.map = L.map('map').setView([lat, lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.handleMapClick(e);
    });
  }

  private async handleMapClick(e: L.LeafletMouseEvent) {
    const { lat, lng } = e.latlng;

    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    this.marker = L.marker([lat, lng]).addTo(this.map);
    this.selectedLocation = { lat, lng };

    await this.obtenerDireccion(lat, lng);  // Obtener la dirección seleccionada
  }

  private async obtenerDireccion(lat: number, lng: number) {
    this.isLoading = true;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();

      // Extraer los detalles de la dirección
      const { road, house_number, suburb, city, postcode } = data.address;

      // Formatear la dirección completa
      this.direccionSeleccionada = `${road || 'Calle desconocida'} ${house_number || ''}, ${suburb || ''}, ${city || 'Ciudad desconocida'} ${postcode || ''}`;

      this.toastr.success('Ubicación seleccionada correctamente');
    } catch (error) {
      this.toastr.error('Error al obtener la dirección');
      this.direccionSeleccionada = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
    } finally {
      this.isLoading = false;
    }
  }
  handleContinue(): void {
    if (!this.selectedLocation) {
      this.toastr.error('Por favor, selecciona una ubicación en el mapa');
      return;
    }
    // Guardar en el storage
    this.denunciaStorage.setDireccion(this.direccionSeleccionada);
    this.router.navigate(['/resumen_de_denunacia_anonima']);
  }


  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }
}
