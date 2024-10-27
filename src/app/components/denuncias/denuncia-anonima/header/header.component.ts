import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { applyTheme, getCurrentIcon, getCurrentTheme } from '../utils/headers/theme-utils';
import { handleSpeak } from '../utils/headers/bot-utils';
import { Subscription } from 'rxjs';
import { toggleSpeakingAnimation, activatePulseAnimation } from '../utils/headers/animation-utils';
import { BotInfoService } from '../../shared/bot/botInfoDenuncias';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() title: string = '';
  @Input() showSpeakButton: boolean = false;
  @Input() componentName: string = '';
  @Input() tipoDenuncia: string | null = null;

  isSpeaking: boolean = false;
  private subscription: Subscription | undefined;

  constructor(
    private location: Location,
    private botInfoService: BotInfoService
  ) { }

  ngOnInit() {
    this.botInfoService.setCurrentComponent(this.componentName);
    this.subscription = this.botInfoService.getCurrentComponent().subscribe(
      component => console.log('Componente actual:', component)
    );
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  goBack(): void {
    this.location.back();
  }

  getTitle(): string {
    return this.componentName === 'subtipos' && this.tipoDenuncia
      ? `Subtipos de ${this.tipoDenuncia}`
      : this.title;
  }

  async speak(): Promise<void> {
    this.isSpeaking = !this.isSpeaking;
    await handleSpeak(this.botInfoService, this.isSpeaking, toggleSpeakingAnimation, activatePulseAnimation);
  }

  getHeaderClass(): string {
    return this.componentName === 'subtipos' ? 'header-subtipos' : '';
  }

  toggleTheme(): void {
    const currentTheme = getCurrentTheme();
    const currentIcon = getCurrentIcon();
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark', currentIcon === 'uil-moon' ? 'uil-sun' : 'uil-moon');

    localStorage.setItem('selected-theme', currentTheme === 'dark' ? 'light' : 'dark');
    localStorage.setItem('selected-icon', currentIcon === 'uil-moon' ? 'uil-sun' : 'uil-moon');
  }
}