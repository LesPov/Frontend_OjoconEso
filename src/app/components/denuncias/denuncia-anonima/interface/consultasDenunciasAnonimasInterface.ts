// Interfaz para la respuesta de consulta
export interface ConsultaDenunciaResponse {
    denuncia: {
      id: number;
      descripcion: string;
      direccion: string;
      status: string;
      tipoDenuncia: {
        nombre: string;
      };
      subtipoDenuncia: {
        nombre: string;
      };
      pruebas: string | null;
      audio: string | null;
    };
  }
  