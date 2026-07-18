import { Injectable, inject, signal, computed } from '@angular/core';
import { TranslationService } from './translation/translation.service';
import { JobDetails } from '@app/utils/entities/job-details';
import { Store } from '@ngrx/store';
import { setJobDetails, updateJobDetailsField } from '../store/apply-wizard/apply-wizard.actions';
import { WizardTabId } from '../store/apply-wizard/apply-wizard.state';

export type HomeTabId = 'dashboard' | 'apply-job' | 'job-tracker' | 'profile';
export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TourStep {
  /** Value of the data-tour attribute on the target element */
  target: string;
  titleKey: keyof ReturnType<TranslationService['t']>['tour'];
  bodyKey: keyof ReturnType<TranslationService['t']>['tour'];
  position: TooltipPosition;
  /** Which home-level tab to activate before this step */
  homeTab?: HomeTabId;
  /** Which apply-job sub-tab to activate before this step */
  applyTab?: WizardTabId;
  /** Optional side-effect to run when entering this step */
  onEnter?: () => void;
}

// ── Mock job description injected at step 4 (no backend call) ────────────────
const MOCK_JOB: JobDetails = {
  companyName: 'Acme Corp GmbH',
  role: 'Senior Frontend Developer (Angular)',
  companyLocation: 'Berlin, Germany',
  appliedDate: new Date().toISOString().split('T')[0],
  status: 'Open',
  salary: '80,000 – 95,000 €',
  contactName: 'Frau Weber',
  jobUrl: 'https://example.com/jobs/senior-frontend',
  jobDescription: `We are looking for a passionate Senior Frontend Developer to join our growing product team in Berlin.

About the Role:
You will lead the development of our next-generation web platform built with Angular 17+, working closely with our product and design teams to deliver exceptional user experiences.

Key Responsibilities:
• Architect and develop complex Angular applications using standalone components, signals, and NgRx
• Collaborate with backend engineers on REST and GraphQL API integration
• Mentor junior developers and conduct code reviews
• Drive performance optimisation and maintain test coverage above 80%
• Participate in agile ceremonies and contribute to technical roadmap discussions

Requirements:
• 4+ years of professional experience with Angular (v14+)
• Strong TypeScript skills and deep understanding of RxJS
• Experience with NgRx or other state management solutions
• Familiarity with CI/CD pipelines (GitLab CI, GitHub Actions)
• German language skills (B1+) are a plus

What We Offer:
• Competitive salary: 80,000 – 95,000 € depending on experience
• 30 days of paid vacation
• Flexible hybrid working (3 days remote per week)
• Company-sponsored BVG ticket
• Budget for professional development and conferences

Start date: As soon as possible
Location: Berlin Mitte (Hybrid)`,
};

@Injectable({ providedIn: 'root' })
export class TourService {
  private store = inject(Store);
  public translate = inject(TranslationService);

  // ── State signals ─────────────────────────────────────────────────────────
  isActive = signal(false);
  currentStep = signal(0);

  // ── Tab signals (read by HomeComponent and ApplyJobComponent) ─────────────
  desiredHomeTab = signal<HomeTabId | null>(null);
  desiredApplyTab = signal<WizardTabId | null>(null);

  // ── Step definitions ──────────────────────────────────────────────────────
  get steps(): TourStep[] {
    return [
      {
        target: 'tour-home-dashboard-tab',
        titleKey: 'step0Title',
        bodyKey: 'step0Body',
        position: 'bottom',
        homeTab: 'dashboard',
      },
      {
        target: 'tour-home-apply-tab',
        titleKey: 'step1Title',
        bodyKey: 'step1Body',
        position: 'bottom',
        homeTab: 'apply-job',
        applyTab: 'Fetch Job',
      },
      {
        target: 'tour-url-input',
        titleKey: 'step2Title',
        bodyKey: 'step2Body',
        position: 'bottom',
        homeTab: 'apply-job',
        applyTab: 'Fetch Job',
      },
      {
        target: 'tour-jd-textarea',
        titleKey: 'step3Title',
        bodyKey: 'step3Body',
        position: 'top',
        homeTab: 'apply-job',
        applyTab: 'Fetch Job',
      },
      {
        target: 'tour-extract-btn',
        titleKey: 'step4Title',
        bodyKey: 'step4Body',
        position: 'top',
        homeTab: 'apply-job',
        applyTab: 'Fetch Job',
        onEnter: () => {
          // Inject mock data without calling the backend
          this.store.dispatch(setJobDetails({jobDetails : MOCK_JOB}));
          this.store.dispatch(updateJobDetailsField({ key: 'jobDescription', value : MOCK_JOB.jobDescription}));
        },
      },
      {
        target: 'tour-wizard-tab-cl',
        titleKey: 'step5Title',
        bodyKey: 'step5Body',
        position: 'bottom',
        homeTab: 'apply-job',
        applyTab: 'Cover Letter',
      },
      {
        target: 'tour-wizard-tab-cv',
        titleKey: 'step6Title',
        bodyKey: 'step6Body',
        position: 'bottom',
        homeTab: 'apply-job',
        applyTab: 'CV',
      },
      {
        target: 'tour-wizard-tab-preview',
        titleKey: 'step7Title',
        bodyKey: 'step7Body',
        position: 'bottom',
        homeTab: 'apply-job',
        applyTab: 'PDF Preview',
      },
      {
        target: 'tour-mark-applied-btn',
        titleKey: 'step8Title',
        bodyKey: 'step8Body',
        position: 'top',
        homeTab: 'apply-job',
        applyTab: 'PDF Preview',
      },
    ];
  }

  totalSteps = computed(() => this.steps.length);
  currentStepDef = computed(() => this.steps[this.currentStep()]);

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  startTour() {
    this.currentStep.set(0);
    this.isActive.set(true);
    this._activateStep(0);
  }

  next() {
    const next = this.currentStep() + 1;
    if (next >= this.steps.length) {
      this.endTour();
      return;
    }
    this.currentStep.set(next);
    this._activateStep(next);
  }

  prev() {
    const prev = this.currentStep() - 1;
    if (prev < 0) return;
    this.currentStep.set(prev);
    this._activateStep(prev);
  }

  skip() {
    this.endTour();
  }

  endTour() {
    this.isActive.set(false);
    this.desiredHomeTab.set(null);
    this.desiredApplyTab.set(null);
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private _activateStep(index: number) {
    const step = this.steps[index];
    if (!step) return;

    // Run the step's side effect first (e.g. inject mock data)
    step.onEnter?.();

    // Signal the desired tabs — components react via effect()
    if (step.homeTab) this.desiredHomeTab.set(step.homeTab);
    if (step.applyTab) this.desiredApplyTab.set(step.applyTab);
  }
}
