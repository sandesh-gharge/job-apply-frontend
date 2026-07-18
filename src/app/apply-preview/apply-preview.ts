import { Component, signal, inject, computed, effect } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';
import { JobsService } from '@app/utils/services/jobs.service';
import { ToastService } from '@app/utils/services/toast.service';
import { CoverLetterDocInfo } from '@app/utils/entities/cover-letter';
import { CLService } from '@app/utils/services/cl.service';
import { Store } from '@ngrx/store';
import { selectProfileInfo } from '@app/utils/store/profile/profile.selector';
import { defaultCV } from '@app/utils/entities/cv';
import { TranslationService } from '@app/utils/services/translation/translation.service';
import {
  selectCoverLetterDetails,
  selectJobDetails,
  selectCvDetails
} from '@app/utils/store/apply-wizard/apply-wizard.selectors';

@Component({
  selector: 'app-pdf-preview',
  templateUrl: './apply-preview.html',
  styleUrl: './apply-preview.scss'
})
export class ApplyPreviewComponent {

  private jobsService = inject(JobsService);
  private toast = inject(ToastService);
  private sanitizer = inject(DomSanitizer);
  public translate = inject(TranslationService);
  private store = inject(Store);

  private cvPreviewUrl = signal<SafeResourceUrl | null>(null);
  private clPreviewUrl = signal<SafeResourceUrl | null>(null);
  private clHtml = signal<string>('');
  private cvHtml = signal<string>('');
  private cvLoading = signal(false);
  private clLoading = signal(false);

  profileInfo = this.store.selectSignal(selectProfileInfo);
  private storedCv = this.store.selectSignal(selectCvDetails);
  cvInfo = computed(() => this.storedCv() || defaultCV());

  /**
   * Cover letter document info from the store — persists across tab switches.
   * Falls back to profile-derived defaults when the store has no data yet.
   */
  private storedCl = this.store.selectSignal(selectCoverLetterDetails);
  private storedJob = this.store.selectSignal(selectJobDetails);

  coverLetterData = computed<CoverLetterDocInfo>(() => {
    const stored = this.storedCl();
    const job = this.storedJob();
    const profile = this.profileInfo();

    if (stored) return stored;

    // Build a fallback from available store data when CL meta hasn't been set yet
    return {
      applicantName: profile ? `${profile.firstName} ${profile.lastName}`.trim() : '',
      applicantLocation: profile?.location || '',
      applicantEmail: profile?.email || '',
      companyName: job?.companyName || '',
      companyLocation: job?.companyLocation || '',
      contactName: job?.contactName || 'Hiring Manager',
      date: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' }),
      role: job?.role || '',
      paragraphs: [],
      signUrl: ''
    };
  });

  constructor() {}

  // Getters for template access
  get cvPreviewUrl$() { return this.cvPreviewUrl; }
  get clPreviewUrl$() { return this.clPreviewUrl; }
  get cvLoading$() { return this.cvLoading; }
  get clLoading$() { return this.clLoading; }

  async fetchPreview(type: 'cv' | 'cl') {
    if (type === 'cv' ? this.cvLoading() : this.clLoading()) return;

    if (type === 'cv') {
      this.cvLoading.set(true);
      this.cvPreviewUrl.set(null);
    } else {
      this.clLoading.set(true);
      this.clPreviewUrl.set(null);
    }

    const data = type === 'cv' ? this.cvInfo().cvData : this.coverLetterData();

    try {
      const html = await firstValueFrom(this.jobsService.fetchPreview(type, data, this.profileInfo()?.id));
      if (!html) throw new Error('No preview content returned');
      this.clHtml.set(type === 'cl' ? html : this.clHtml());
      this.cvHtml.set(type === 'cv' ? html : this.cvHtml());
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);

      if (type === 'cv') {
        this.cvPreviewUrl.set(safeUrl);
      } else {
        this.clPreviewUrl.set(safeUrl);
      }
    } catch (error) {
      console.error(`Error fetching ${type} preview:`, error);
      this.toast.show(type === 'cv' ? this.translate.t().applyPreview.toastFailPreviewCv : this.translate.t().applyPreview.toastFailPreviewCl, 'error');
      this.toast.show(this.translate.t().applyPreview.toastMissingFields, 'error');
    } finally {
      if (type === 'cv') {
        this.cvLoading.set(false);
      } else {
        this.clLoading.set(false);
      }
    }
  }

  async downloadPDF(type: 'cv' | 'cl') {
    if (type === 'cv') {
      this.cvLoading.set(true);
    } else {
      this.clLoading.set(true);
    }
    const data = type === 'cv' ? this.cvHtml() : this.clHtml();

    const name = [this.profileInfo()?.firstName,this.profileInfo()?.lastName].join("_");

    try {
      const blob = await firstValueFrom(this.jobsService.downloadPDF(type, { html : data }));
      if (!blob) throw new Error('No PDF content returned');

      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = type === 'cv' ? [name, "CV.pdf"].join("_") : [name, "CoverLetter.pdf"].join("_");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);

      this.toast.show(type === 'cv' ? this.translate.t().applyPreview.toastDownloadedCv : this.translate.t().applyPreview.toastDownloadedCl);
    } catch (error) {
      console.error(`Error downloading ${type} PDF:`, error);
      this.toast.show(type === 'cv' ? this.translate.t().applyPreview.toastFailDownloadCv : this.translate.t().applyPreview.toastFailDownloadCl, 'error');
    } finally {
      if (type === 'cv') {
        this.cvLoading.set(false);
      } else {
        this.clLoading.set(false);
      }
    }
  }
}