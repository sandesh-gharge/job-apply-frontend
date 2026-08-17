import { Component, signal, inject, computed, effect, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';
import { JobsService } from '@app/utils/services/jobs.service';
import { ToastService } from '@app/utils/services/toast.service';
import { CoverLetterDocInfo } from '@app/utils/entities/cover-letter';
import { Store } from '@ngrx/store';
import { selectProfileInfo } from '@app/utils/store/profile/profile.selector';
import { defaultCV } from '@app/utils/entities/cv';
import { TranslationService } from '@app/utils/services/translation/translation.service';
import { FormsModule } from '@angular/forms';
import {
  selectCoverLetterDetails,
  selectJobDetails,
  selectCvDetails
} from '@app/utils/store/apply-wizard/apply-wizard.selectors';
import { setSelectedClTemplate, setSelectedCvTemplate } from '@app/utils/store/templates/templates.actions';
import { selectedClTemplateId, selectedCvTemplateId } from '@app/utils/store/templates/templates.selector';

@Component({
  selector: 'app-pdf-preview',
  imports: [FormsModule],
  templateUrl: './apply-preview.html',
  styleUrl: './apply-preview.scss'
})
export class ApplyPreviewComponent {

  private jobsService = inject(JobsService);
  private toast = inject(ToastService);
  private sanitizer = inject(DomSanitizer);
  public translate = inject(TranslationService);
  private store = inject(Store);

  @ViewChild('cvIframe') cvIframe?: ElementRef<HTMLIFrameElement>;
  @ViewChild('clIframe') clIframe?: ElementRef<HTMLIFrameElement>;

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

  cvTemplates = this.store.selectSignal((state: any) => state.templates.cvTemplates);
  clTemplates = this.store.selectSignal((state: any) => state.templates.clTemplates);

  selectedCvTemplateId = this.store.selectSignal(selectedCvTemplateId);
  selectedClTemplateId = this.store.selectSignal(selectedClTemplateId);

  onCvTemplateChange(id: string | null) {
    this.store.dispatch(setSelectedCvTemplate({ id }));
    if (this.cvHtml()) { // If already generated, re-generate preview
      this.fetchPreview('cv');
    }
  }

  onClTemplateChange(id: string | null) {
    this.store.dispatch(setSelectedClTemplate({ id }));
    if (this.clHtml()) {
      this.fetchPreview('cl');
    }
  }

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
    const templateId = type === 'cv' ? this.selectedCvTemplateId() : this.selectedClTemplateId();

    try {
      const html = await firstValueFrom(this.jobsService.fetchPreview(type, data, this.profileInfo()?.id, templateId));
      if (!html) throw new Error('No preview content returned');
      this.clHtml.set(type === 'cl' ? html : this.clHtml());
      this.cvHtml.set(type === 'cv' ? html : this.cvHtml());

      // Inject title for print PDF output name and print CSS rules
      let styledHtml = html;
      const firstName = this.profileInfo()?.firstName || 'Document';
      const lastName = this.profileInfo()?.lastName || '';
      const docTypeLabel = type === 'cv' ? 'CV' : 'Cover_Letter';
      const docTitle = `${firstName}_${lastName}_${docTypeLabel}`.trim();

      const printHeadEnhancement = `
        <title>${docTitle}</title>
        <style>
          @page { size: A4 portrait; margin: 0; }
          @media print {
            body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          }
        </style>
      `;

      if (styledHtml.includes('<head>')) {
        styledHtml = styledHtml.replace('<head>', `<head>${printHeadEnhancement}`);
      } else {
        styledHtml = `<!DOCTYPE html><html><head>${printHeadEnhancement}</head><body>${styledHtml}</body></html>`;
      }

      const blob = new Blob([styledHtml], { type: 'text/html' });
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

    try {
      const hasPreview = type === 'cv' ? !!this.cvPreviewUrl() : !!this.clPreviewUrl();
      if (!hasPreview) {
        await this.fetchPreview(type);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const iframeEl = type === 'cv' ? this.cvIframe?.nativeElement : this.clIframe?.nativeElement;

      if (iframeEl && iframeEl.contentWindow) {
        iframeEl.contentWindow.focus();
        iframeEl.contentWindow.print();
        this.toast.show(type === 'cv' ? this.translate.t().applyPreview.toastDownloadedCv : this.translate.t().applyPreview.toastDownloadedCl);
      } else {
        throw new Error('Iframe element or contentWindow is unavailable');
      }
    } catch (error) {
      console.error(`Error printing ${type} PDF:`, error);
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