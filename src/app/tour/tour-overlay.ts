import {
  Component,
  inject,
  signal,
  computed,
  effect,
  AfterViewInit,
  OnDestroy,
  NgZone,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { TourService } from '@app/utils/services/tour.service';
import { TranslationService } from '@app/utils/services/translation/translation.service';

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TooltipPos {
  top: string;
  left: string;
  transform: string;
}

@Component({
  selector: 'app-tour-overlay',
  standalone: true,
  templateUrl: './tour-overlay.html',
  styleUrl: './tour-overlay.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourOverlayComponent implements AfterViewInit, OnDestroy {
  public tourService = inject(TourService);
  public translate = inject(TranslationService);
  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  /** Render whenever the tour is active, for any role */
  isVisible = computed(() => this.tourService.isActive());

  spotlightRect = signal<SpotlightRect | null>(null);
  tooltipPos = signal<TooltipPos>({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });

  private resizeObserver: ResizeObserver | null = null;
  private positionTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // Reposition whenever the step changes
    effect(() => {
      const step = this.tourService.currentStepDef();
      if (step && this.tourService.isActive()) {
        // Small delay to allow Angular to render the newly-activated tab content
        this.schedulePosition(step.target, step.position);
      }
    });
  }

  ngAfterViewInit() {
    this.resizeObserver = new ResizeObserver(() => {
      this.zone.run(() => {
        const step = this.tourService.currentStepDef();
        if (step) this.updatePosition(step.target, step.position);
      });
    });
    this.resizeObserver.observe(document.body);
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
    if (this.positionTimer) clearTimeout(this.positionTimer);
  }

  private schedulePosition(target: string, position: string) {
    if (this.positionTimer) clearTimeout(this.positionTimer);
    this.positionTimer = setTimeout(() => {
      this.zone.run(() => {
        this.updatePosition(target, position);
        this.cdr.markForCheck();
      });
    }, 200);
  }

  private updatePosition(target: string, position: string) {
    const el = document.querySelector(`[data-tour="${target}"]`) as HTMLElement | null;
    if (!el) {
      // No target element visible — center the tooltip, no spotlight
      this.spotlightRect.set(null);
      this.tooltipPos.set({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
      return;
    }

    const rect = el.getBoundingClientRect();
    const padding = 8;

    this.spotlightRect.set({
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    });

    // Tooltip card is 320px wide, 200px tall (approx)
    const cardW = 340;
    const cardH = 210;
    const gap = 16;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let top = 0;
    let left = 0;
    let transform = 'none';

    switch (position) {
      case 'bottom':
        top = rect.bottom + gap;
        left = rect.left + rect.width / 2 - cardW / 2;
        break;
      case 'top':
        top = rect.top - cardH - gap;
        left = rect.left + rect.width / 2 - cardW / 2;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - cardH / 2;
        left = rect.right + gap;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - cardH / 2;
        left = rect.left - cardW - gap;
        break;
    }

    // Clamp inside viewport
    left = Math.max(16, Math.min(left, vw - cardW - 16));
    top = Math.max(16, Math.min(top, vh - cardH - 16));

    this.tooltipPos.set({ top: `${top}px`, left: `${left}px`, transform });
  }

  /** Scroll the highlighted element into view */
  scrollToTarget(target: string) {
    const el = document.querySelector(`[data-tour="${target}"]`) as HTMLElement | null;
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}
