// src/app/interfaces/subtipoDenunciaInterface.ts
export interface SubtipoDenunciaInterface {
    id: number;                 // ID del subtipo de denuncia
    tipoDenunciaId: number;      // ID del tipo de denuncia asociado
    flagImage: string; // Añadir esta propiedad

    nombre: string;              // Nombre del subtipo de denuncia
    descripcion?: string;        // Descripción del subtipo de denuncia (opcional)
  }
  