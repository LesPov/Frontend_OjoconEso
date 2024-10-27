// utils/headers/theme-utils.ts

export const darkTheme = 'dark-theme';
export const iconTheme = 'uil-sun';

export function getCurrentTheme(): string {
  return document.body.classList.contains(darkTheme) ? 'dark' : 'light';
}

export function getCurrentIcon(): string {
  const themeButton = document.getElementById('theme-button');
  return themeButton?.classList.contains(iconTheme) ? 'uil-moon' : 'uil-sun';
}

export function applyTheme(theme: string, icon: string): void {
  document.body.classList[theme === 'dark' ? 'add' : 'remove'](darkTheme);
  getElementByIdAndApplyClass('theme-button', iconTheme, icon === 'uil-moon');
}

function getElementByIdAndApplyClass(id: string, className: string, shouldAdd: boolean): void {
  const element = document.getElementById(id);
  if (element) {
    element.classList[shouldAdd ? 'add' : 'remove'](className);
  }
}
