// src/app/services/denunciaStorage.service.ts
import { Injectable } from '@angular/core';
import { DenunciaAnonimaInterface } from '../interface/denunciaAnonimaInterface';

@Injectable({
  providedIn: 'root'
})
export class DenunciaStorageService {
  private denuncia: Partial<DenunciaAnonimaInterface> = {};

  // Método para almacenar el tipo de denuncia
  setTipoDenuncia(tipo: string) {
    this.denuncia.nombreTipo = tipo;
  }

  // Método para almacenar el subtipo de denuncia
  setSubtipoDenuncia(subtipo: string) {
    this.denuncia.nombreSubtipo = subtipo;
  }

  // Método para almacenar la descripción, pruebas, etc.
  setDescripcionPruebas(descripcion: string, pruebas?: string, audio?: string) {
    this.denuncia.descripcion = descripcion;
    if (pruebas) this.denuncia.pruebas = pruebas; // Puede ser una lista de rutas separadas por comas
    if (audio) this.denuncia.audio = audio; // Ruta del archivo de audio
  }
  

  // Método para almacenar la dirección
  setDireccion(direccion: string) {
    this.denuncia.direccion = direccion;
  }

  // Obtener los datos completos para crear la denuncia
  getDenuncia(): Partial<DenunciaAnonimaInterface> {
    return this.denuncia;
  }

  // Método para limpiar los datos después de enviar la denuncia
  resetDenuncia() {
    this.denuncia = {};
  }
}
