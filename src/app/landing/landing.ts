import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { TranslationService } from '@app/utils/services/translation/translation.service';
import { ThemeService } from '@app/utils/services/theme.service';
import { NameLogo } from '@app/name-logo/name-logo';
import { LoginComponent } from '@app/login/login';
import { Router } from '@angular/router';

export type FeatureKey = 'applyWizard' | 'cvBuilder' | 'clBuilder' | 'jobTracker';

export interface FeatureItem {
  id: string;
  key: FeatureKey;
  icon: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [NameLogo, LoginComponent],
  templateUrl: './landing.html',
  styleUrl: './landing.scss'
})
export class LandingComponent implements OnInit, OnDestroy {
  public translate = inject(TranslationService);
  public themeService = inject(ThemeService);
  public router = inject(Router);

  // Modal signal state
  showLoginModal = signal(false);

  // Active feature slideshow index
  activeSlide = signal(0);
  isPaused = false;
  private autoSlideInterval: any;

  features: FeatureItem[] = [
    { id: 'applyWizard', key: 'applyWizard', icon: '🧙‍♂️' },
    { id: 'cvBuilder', key: 'cvBuilder', icon: '📄' },
    { id: 'clBuilder', key: 'clBuilder', icon: '✍️' },
    { id: 'jobTracker', key: 'jobTracker', icon: '📊' }
  ];

  ngOnInit(): void {
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  openLoginModal(): void {
    this.showLoginModal.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeLoginModal(): void {
    this.showLoginModal.set(false);
    document.body.style.overflow = 'auto';
  }

  setSlide(index: number): void {
    this.activeSlide.set(index);
  }

  nextSlide(): void {
    this.activeSlide.update(curr => (curr + 1) % this.features.length);
  }

  prevSlide(): void {
    this.activeSlide.update(curr => (curr - 1 + this.features.length) % this.features.length);
  }

  pauseSlide(): void {
    this.isPaused = true;
  }

  resumeSlide(): void {
    this.isPaused = false;
  }

  private startAutoSlide(): void {
    this.autoSlideInterval = setInterval(() => {
      if (!this.isPaused) {
        this.nextSlide();
      }
    }, 5000);
  }

  private stopAutoSlide(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
