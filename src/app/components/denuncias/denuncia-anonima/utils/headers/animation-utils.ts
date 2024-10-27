// utils/headers/animation-utils.ts

export function activatePulseAnimation(): void {
    const element = document.querySelector('.cuadro');
    if (element) {
      element.classList.add('pulse-animation');  // Activamos la animación de pulso
    }
  }
  
  export function toggleSpeakingAnimation(isSpeaking: boolean): void {
    const element = document.querySelector('.cuadro');
    if (element) {
      element.classList[isSpeaking ? 'add' : 'remove']('speaking');
    }
  }
  