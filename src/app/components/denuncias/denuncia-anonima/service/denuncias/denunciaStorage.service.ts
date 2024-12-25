import { Injectable } from '@angular/core';
import { DenunciaAnonimaInterface } from '../../interface/denunciaAnonimaInterface';

@Injectable({
  providedIn: 'root'
})
export class DenunciaStorageService {
  private denuncia: Partial<DenunciaAnonimaInterface> = {};
  private pruebasFiles: File[] = [];
  private audioFiles: File[] = [];

  // Método para almacenar el tipo de denuncia
  setTipoDenuncia(tipo: string) {
    this.denuncia.nombreTipo = tipo;
  }

  // Método para almacenar el subtipo de denuncia
  setSubtipoDenuncia(subtipo: string) {
    this.denuncia.nombreSubtipo = subtipo;
  }

  // Método actualizado para manejar archivos
  setDescripcionPruebas(descripcion: string, pruebas?: File[], audio?: File[]) {
    this.denuncia.descripcion = descripcion;

    if (pruebas && pruebas.length > 0) {
      this.pruebasFiles = pruebas;
      this.denuncia.pruebas = pruebas.map(file => file.name).join(',');
      console.log('Pruebas guardadas:', this.pruebasFiles);
    }

    if (audio && audio.length > 0) {
      this.audioFiles = audio;
      this.denuncia.audio = audio.map(file => file.name).join(',');
      console.log('Audio guardado:', this.audioFiles);
    }
  }

  // Método para almacenar la dirección
  setDireccion(direccion: string) {
    this.denuncia.direccion = direccion;
  }

  // Obtener los datos completos para crear la denuncia
  getDenuncia(): Partial<DenunciaAnonimaInterface> {
    return this.denuncia;
  }

  // Nuevos métodos para obtener los archivos
  getPruebasFiles(): File[] {
    return this.pruebasFiles;
  }

  getAudioFiles(): File[] {
    return this.audioFiles;
  }

  // Método para limpiar los datos después de enviar la denuncia
  resetDenuncia() {
    this.denuncia = {};
    this.pruebasFiles = [];
    this.audioFiles = [];
  }
}