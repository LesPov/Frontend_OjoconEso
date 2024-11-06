import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { TipoDenunciaInterface } from '../interface/tipoDenunciaInterface';
import { DenunciaAnonimaInterface } from '../interface/denunciaAnonimaInterface';
import { ConsultaDenunciaResponse } from '../interface/consultasDenunciasAnonimasInterface';

@Injectable({
  providedIn: 'root'
})
export class DenunciasService {
  private baseUrl: string = `${environment.endpoint}api/denuncias/`;
  private headers = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(private http: HttpClient) {}

  // Obtener lista de tipos de denuncias anónimas o ambas
  getTiposDenunciaAnonimas(): Observable<TipoDenunciaInterface[]> {
    return this.http.get<TipoDenunciaInterface[]>(`${this.baseUrl}tipos/anonimas`);
  }

  // Obtener subtipos según el tipo de denuncia
  getSubtiposDenuncia(nombreTipoDenuncia: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}tipos/subtiposdenuncia/${nombreTipoDenuncia}`);
  }

 
  // Crear una denuncia anónima con archivos de prueba y audio
  crearDenunciaAnonima(
    denuncia: DenunciaAnonimaInterface,
    pruebas: File[] = [],
    audios: File[] = []
  ): Observable<{ message: string; nuevaDenuncia: DenunciaAnonimaInterface }> {
    const formData = new FormData();

    // Agrega los campos de la denuncia al FormData
    formData.append('descripcion', denuncia.descripcion);
    formData.append('direccion', denuncia.direccion);
    formData.append('nombreTipo', denuncia.nombreTipo);
    formData.append('nombreSubtipo', denuncia.nombreSubtipo);

    // Agrega cada archivo de prueba
    pruebas.forEach((file, index) => {
      formData.append('pruebas', file, file.name);
    });

    // Agrega cada archivo de audio
    audios.forEach((file, index) => {
      formData.append('audio', file, file.name);
    });

    return this.http.post<{ message: string; nuevaDenuncia: DenunciaAnonimaInterface }>(
      `${this.baseUrl}denuncias/`,
      formData
    );
  }

   // Nuevo servicio para consultar una denuncia anónima por clave única
   consultarDenunciaAnonima(claveUnica: string): Observable<ConsultaDenunciaResponse> {
    return this.http.get<ConsultaDenunciaResponse>(
      `${this.baseUrl}denuncias/consultas_anonimas`,
      {
        headers: this.headers,
        params: { claveUnica } // claveUnica se envía como parámetro de consulta
      }
    );
  }
  
}