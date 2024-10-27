import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Declaración de la librería ResponsiveVoice
declare var responsiveVoice: any;

@Injectable({
  providedIn: 'root'
})
export class BotInfoService {
  // Lista actual de frases o información que el bot puede leer
  private currentInfoList: string[] = [];

  // Componente actual donde está operando el bot
  private currentComponentSubject = new BehaviorSubject<string>('anonima');

  // Índice para rastrear la frase actual en la lista de información
  private infoIndexSubject = new BehaviorSubject<number>(0);

  // Indicadores de estado para pausar y controlar la locución
  private isPaused = false;
  private isSpeaking = false;

  constructor() {
    // Inicializa ResponsiveVoice si está disponible
    if (responsiveVoice) {
      responsiveVoice.init();
    }
  }
 
  /**
   * Establece el componente actual y resetea el índice de la lista de información.
   * @param component - Nombre del componente actual
   */
  setCurrentComponent(component: string): void {
    this.currentComponentSubject.next(component);
    this.infoIndexSubject.next(0);
  }

  /**
   * Obtiene el componente actual como un observable.
   * @returns Observable<string> - El nombre del componente actual
   */
  getCurrentComponent(): Observable<string> {
    return this.currentComponentSubject.asObservable();
  }

  /**
   * Establece la lista de frases que el bot va a leer.
   * @param infoList - Lista de frases o información
   */
  setInfoList(infoList: string[]): void {
    this.currentInfoList = infoList;
    this.infoIndexSubject.next(0);
  }

  /**
   * Obtiene la siguiente frase en la lista de información.
   * Si llega al final de la lista, vuelve al principio.
   * @returns string - La frase que debe ser leída
   */
  getNextInfo(): string {
    const currentIndex = this.infoIndexSubject.value;

    if (this.currentInfoList.length === 0) {
      return "No hay información disponible.";
    }

    const info = this.currentInfoList[currentIndex];
    const nextIndex = (currentIndex + 1) % this.currentInfoList.length;
    this.infoIndexSubject.next(nextIndex);

    return info;
  }

  /**
   * Hace que el bot lea el texto en voz alta.
   * @param text - El texto a leer
   * @returns Promise<void> - Resuelve cuando termina de hablar o se produce un error
   */
  speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (responsiveVoice) {
        // Cancela cualquier locución anterior antes de comenzar una nueva
        this.cancelSpeak();
        this.isSpeaking = true;

        // Configura la voz para que suene más natural y ajusta la velocidad
        responsiveVoice.speak(text, "Spanish Latin American Female", {
          pitch: 1.1,
          rate: 1.2, // Velocidad ligeramente reducida para mejorar la naturalidad
          onend: () => {
            this.isSpeaking = false;
            resolve();
          },
          onerror: (error: any) => {
            this.isSpeaking = false;
            reject(error);
          }
        });
      } else {
        reject('ResponsiveVoice no está disponible.');
      }
    });
  }

  /**
   * Pausa la locución actual.
   */
  pauseSpeak(): void {
    if (responsiveVoice && this.isSpeaking && !this.isPaused) {
      responsiveVoice.pause();
      this.isPaused = true;
    }
  }

  /**
   * Reanuda la locución pausada.
   */
  resumeSpeak(): void {
    if (responsiveVoice && this.isPaused) {
      responsiveVoice.resume();
      this.isPaused = false;
    }
  }

  /**
   * Cancela cualquier locución en curso.
   */
  cancelSpeak(): void {
    if (responsiveVoice) {
      responsiveVoice.cancel();
      this.isPaused = false;
      this.isSpeaking = false;
    }
  }

  /**
   * Verifica si el bot está hablando en este momento.
   * @returns boolean - True si el bot está hablando, false si no lo está
   */
  isSpeakingNow(): boolean {
    return this.isSpeaking;
  }
}
