import { Injectable, signal, effect, inject } from '@angular/core';
import { StorageService } from './storage.service';

export type ThemeType = 'soft' | 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private storageService = inject(StorageService);
  
  theme = signal<ThemeType>(this.getInitialTheme());

  constructor() {
    // Automatically apply theme updates to document attribute
    effect(() => {
      const activeTheme = this.theme();
      document.documentElement.setAttribute('data-theme', activeTheme);
      this.storageService.set('theme', activeTheme);
      const favicon = document.getElementById('app-favicon') as HTMLLinkElement;
      if (favicon) {
        favicon.href = `assets/logo-light.svg?v=2`;
      }
    });
  }

  toggleTheme() {
    this.theme.update(current => {
      if (current === 'soft') return 'dark';
      if (current === 'dark') return 'light';
      return 'soft';
    });
  }

  private getInitialTheme(): ThemeType {
    const saved = this.storageService.get<ThemeType | null>('theme', null);
    if (saved === 'soft' || saved === 'light' || saved === 'dark') {
      return saved;
    }
    return 'soft'; // Default to Soft Slate (eye-friendly semi-light)
  }
}
