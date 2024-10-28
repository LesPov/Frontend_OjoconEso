export interface DenunciaAnonimaInterface {
    descripcion: string;
    direccion: string;
    nombreTipo: string;
    nombreSubtipo: string;
    pruebas?: string;
    audio?: string;
    claveUnica: string; // Nueva columna para la clave única
    tieneEvidencia?: boolean;
  }
  