import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

declare var responsiveVoice: any;

@Injectable({
  providedIn: 'root'
})
export class BotInfoService {
  private currentInfoList: string[] = [];
  private headerInfoList: string[] = [];
  private currentComponentSubject = new BehaviorSubject<string>('anonima');
  private infoIndexSubject = new BehaviorSubject<number>(0);
  private scrollIndexSubject = new BehaviorSubject<number>(0);
  private isPaused = false;
  private isSpeaking = false;
  private isSpeakingSubject = new BehaviorSubject<boolean>(false); // Nuevo BehaviorSubject

  constructor() {
    if (responsiveVoice) {
      responsiveVoice.init();
    }
  }

  setCurrentComponent(component: string): void {
    this.currentComponentSubject.next(component);
    this.infoIndexSubject.next(0);
  }

  getCurrentComponent(): Observable<string> {
    return this.currentComponentSubject.asObservable();
  }

  setInfoList(infoList: string[]): void {
    this.currentInfoList = infoList;
    this.infoIndexSubject.next(0);
  }

  setHeaderInfoList(infoList: string[]): void {
    this.headerInfoList = infoList;
    this.infoIndexSubject.next(0);
  }

  getNextInfo(): string {
    const currentIndex = this.infoIndexSubject.value;
    if (this.currentInfoList.length === 0) return "No hay información disponible.";

    const info = this.currentInfoList[currentIndex];
    if (this.currentComponentSubject.value === 'anonima') {
      this.scrollIndexSubject.next(currentIndex);
    }
    
    this.infoIndexSubject.next((currentIndex + 1) % this.currentInfoList.length);
    return info;
  }

  getSingleInfo(): string {
    return this.currentInfoList.length > 0 ? this.currentInfoList[0] : "No hay información disponible.";
  }

  getScrollIndex(): Observable<number> {
    return this.scrollIndexSubject.asObservable();
  }

  speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (responsiveVoice) {
        this.cancelSpeak();
        this.isSpeaking = true;
        this.isSpeakingSubject.next(true); // Emitir el estado de isSpeaking

        responsiveVoice.speak(text, "Spanish Latin American Female", {
          pitch: 1.1,
          rate: 1.2,
          onend: () => {
            this.isSpeaking = false;
            this.isSpeakingSubject.next(false); // Emitir el estado de isSpeaking
            resolve();
          },
          onerror: (error: any) => {
            this.isSpeaking = false;
            this.isSpeakingSubject.next(false); // Emitir el estado de isSpeaking
            reject(error);
          }
        });
      } else {
        reject('ResponsiveVoice no está disponible.');
      }
    });
  }

  pauseSpeak(): void {
    if (responsiveVoice && this.isSpeaking && !this.isPaused) {
      responsiveVoice.pause();
      this.isPaused = true;
    }
  }

  resumeSpeak(): void {
    if (responsiveVoice && this.isPaused) {
      responsiveVoice.resume();
      this.isPaused = false;
    }
  }

  cancelSpeak(): void {
    if (responsiveVoice) {
      responsiveVoice.cancel();
      this.isPaused = false;
      this.isSpeaking = false;
      this.isSpeakingSubject.next(false); // Emitir el estado de isSpeaking
    }
  }

  isSpeakingNow(): boolean {
    return this.isSpeaking;
  }

  getIsSpeaking(): Observable<boolean> {
    return this.isSpeakingSubject.asObservable(); // Método para obtener el observable
  }
}