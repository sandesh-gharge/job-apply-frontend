import { Component, effect, inject, OnInit, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../utils/services/toast.service';
import { ProfileInfo, ApiAgentInfo } from '../utils/entities/user';
import { Store } from '@ngrx/store';
import { selectProfileInfo, selectActiveAgent, selectSelectedCvTemplate, selectSelectedClTemplate } from '../utils/store/profile/profile.selector';
import { updateProfileInfo, updateSelectedAgentId, createAgent, updateAgent, updateSelectedCvTemplate, updateSelectedClTemplate } from '../utils/store/profile/profile.actions';
import { ProfileService } from '@app/utils/services/profile.service';
import { TranslationService } from '@app/utils/services/translation/translation.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-info',
  imports: [FormsModule],
  templateUrl: './profile-info.html',
  styleUrl: './profile-info.scss',
})
export class ProfileInfoComponent implements OnInit {

  private toast = inject(ToastService);
  private profileService = inject(ProfileService);
  private store = inject(Store);
  public translate = inject(TranslationService);
  private router = inject(Router);

  profileImageUrl = signal<string>('');
  signatureImageUrl = signal<string>('');

  @ViewChild('agentDialog') agentDialog!: ElementRef<HTMLDialogElement>;
  isEditMode = signal(false);
  agentForm = signal<ApiAgentInfo>({ name: '', isPublic: false, agentApiUrl: '', agentApiKey: '', modelName: '' });

  constructor() {
    effect(() => {
      const tempProfile = this.profileFromStore();
      if (tempProfile) {
        this.profile.set(tempProfile)
      }
    })
  }

  ngOnInit(): void {
    // Images are not loaded automatically on load.
  }

  loadProfileImage(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (!this.profile().profileImageUrl) {
      this.toast.show(this.translate.t().profile.toastNoPhoto, 'info');
      return;
    }
    this.profileService.getImageUrl('profile-image').then(url => {
      if (url) {
        this.profileImageUrl.set(url);
      } else {
        this.toast.show(this.translate.t().profile.toastNoPhoto, 'info');
      }
    });
  }

  loadSignatureImage(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (!this.profile().signatureImageUrl) {
      this.toast.show(this.translate.t().profile.toastNoSignature, 'info');
      return;
    }
    this.profileService.getImageUrl('signature').then(url => {
      if (url) {
        this.signatureImageUrl.set(url);
      } else {
        this.toast.show(this.translate.t().profile.toastNoSignature, 'info');
      }
    });
  }

  profileFromStore = this.store.selectSignal(selectProfileInfo);
  profile = signal<ProfileInfo>({
    id: '',
    firstName: '',
    lastName: '',
    location: '',
    email: '',
    selectedAgentId: null,
    selectedCvTemplate: null,
    selectedClTemplate: null,
    userApiAgents: [],
    profileImageUrl: '',
    signatureImageUrl: '',
    role: 'guest',
    useDefaultApi: true
  });

  activeAgentStore = computed(this.store.selectSignal(selectActiveAgent));

  isDirty = signal(false);
  imageChanged = signal(false);

  onFieldChange<K extends keyof ProfileInfo>(field: K, value: ProfileInfo[K]): void {
    this.profile.update(p => ({ ...p, [field]: value }));
    this.isDirty.set(true);
  }

  onImageSelected(field: 'profileImageUrl' | 'signatureImageUrl', event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.toast.show(this.translate.t().profile.toastValidImage, 'error');
      return;
    }

    // Validate file size (max 1MB)
    const maxSize = 1024 * 1024;
    if (file.size > maxSize) {
      this.toast.show(this.translate.t().profile.toastImageSize, 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      //this.profile.update(p => ({ ...p, [field]: dataUrl }));
      if (field === 'profileImageUrl') {
        this.profileImageUrl.set(dataUrl);
      } else {
        this.signatureImageUrl.set(dataUrl);
      }
      this.isDirty.set(true);
      this.imageChanged.set(true);
    };
    reader.readAsDataURL(file);
  }

  saveChanges(): void {
    if (!this.isDirty())
      return

    if(this.imageChanged()) {
      this.profile.update(p => ({
        ...p,
        profileImageUrl: this.profileImageUrl(),
        signatureImageUrl: this.signatureImageUrl()
      }));
    }

    this.store.dispatch(updateProfileInfo({ profileInfo: this.profile() }));
    this.isDirty.set(false);
    this.imageChanged.set(false);

  }

  openSetPassword(): void {
    this.router.navigate(['/set-password']);
  }

  onAgentSelectionChange(newId: string | null): void {
    const agentId = newId === 'null' ? null : newId;
    this.profile.update(p => ({ ...p, selectedAgentId: agentId }));
    
    // Dispatch a local update so the activeAgentStore selector updates 
    // and instantly updates the preview fields without calling the backend.
    this.store.dispatch(updateSelectedAgentId({ selectedAgentId: agentId }));
    
    this.isDirty.set(true);
  }

  openAgentDialog(isEdit: boolean): void {
    this.isEditMode.set(isEdit);
    const selected = this.profile().userApiAgents?.find(a => a.id === this.profile().selectedAgentId);
    if (isEdit && selected) {
      this.agentForm.set({ ...selected });
    } else {
      this.agentForm.set({ name: '', isPublic: false, agentApiUrl: '', agentApiKey: '', modelName: '' });
    }
    this.agentDialog.nativeElement.showModal();
  }

  closeAgentDialog(): void {
    this.agentDialog.nativeElement.close();
  }

  saveAgentDetails(): void {
    const agent = { ...this.agentForm() };
    if (!agent.name) {
      this.toast.show('Agent name is required', 'error');
      return;
    }
    
    // Attach the userId for creating
    agent.userId = this.profile().id;

    if (this.isEditMode() && agent.id) {
      const { id, userId, ...updateData } = agent;
      this.store.dispatch(updateAgent({ id, agent: updateData }));
    } else {
      this.store.dispatch(createAgent({ agent }));
    }
    
    // Turn on dirty flag so user can click save after adding/editing
    this.isDirty.set(true);
    
    this.closeAgentDialog();
  }

  // --- Themes Logic ---
  cvTemplates = this.store.selectSignal((state: any) => state.templates.cvTemplates);
  clTemplates = this.store.selectSignal((state: any) => state.templates.clTemplates);
  selectedCvTemplateId = this.store.selectSignal(selectSelectedCvTemplate);
  selectedClTemplateId = this.store.selectSignal(selectSelectedClTemplate);

  safeSelectedCvTemplateId = computed(() => {
    const id = this.selectedCvTemplateId();
    if (!id) return null;
    return this.cvTemplates().find((t: any) => t._id === id) ? id : null;
  });

  safeSelectedClTemplateId = computed(() => {
    const id = this.selectedClTemplateId();
    if (!id) return null;
    return this.clTemplates().find((t: any) => t._id === id) ? id : null;
  });
  themePreviewHtml = this.store.selectSignal((state: any) => state.templates.previewHtml);
  includePublicThemes = signal(false);

  @ViewChild('themeDialog') themeDialog!: ElementRef<HTMLDialogElement>;
  isEditThemeMode = signal(false);
  themeDocType = signal<'cv'|'cl'>('cv');
  themeForm = signal<{_id?: string; name: string; html_template: string; isPublic: boolean}>({ name: '', html_template: '', isPublic: false });

  loadThemes() {
    const userId = this.profile().id;
    if (!userId) return;
    this.store.dispatch({ type: '[Templates] Load Templates', docType: 'cv', userId, includePublic: this.includePublicThemes() });
    this.store.dispatch({ type: '[Templates] Load Templates', docType: 'cl', userId, includePublic: this.includePublicThemes() });
  }

  togglePublicThemes(checked: boolean) {
    this.includePublicThemes.set(checked);
    this.loadThemes();
  }

  onCvTemplateChange(id: string | null) {
    this.store.dispatch(updateSelectedCvTemplate({ selectedCvTemplate: id }));
    this.profile.update(p => ({ ...p, selectedCvTemplate: id }));
    this.isDirty.set(true);
  }

  onClTemplateChange(id: string | null) {
    this.store.dispatch(updateSelectedClTemplate({ selectedClTemplate: id }));
    this.profile.update(p => ({ ...p, selectedClTemplate: id }));
    this.isDirty.set(true);
  }

  canEditCvTheme(): boolean {
    const id = this.selectedCvTemplateId();
    if (!id) return false;
    const t = this.cvTemplates().find((x: any) => x._id === id);
    return t ? t.userId === this.profile().id : false;
  }

  canEditClTheme(): boolean {
    const id = this.selectedClTemplateId();
    if (!id) return false;
    const t = this.clTemplates().find((x: any) => x._id === id);
    return t ? t.userId === this.profile().id : false;
  }

  openThemeDialog(isEdit: boolean, docType: 'cv' | 'cl') {
    this.isEditThemeMode.set(isEdit);
    this.themeDocType.set(docType);
    this.store.dispatch({ type: '[Templates] Clear Preview' });

    if (isEdit) {
      const id = docType === 'cv' ? this.selectedCvTemplateId() : this.selectedClTemplateId();
      const list = docType === 'cv' ? this.cvTemplates() : this.clTemplates();
      const selected = list.find((x: any) => x._id === id);
      if (selected) {
        this.themeForm.set({ _id: selected._id, name: selected.name, html_template: selected.html_template, isPublic: selected.isPublic });
      }
    } else {
      this.themeForm.set({ name: '', html_template: '', isPublic: false });
    }
    this.themeDialog.nativeElement.showModal();
  }

  closeThemeDialog() {
    this.themeDialog.nativeElement.close();
  }

  previewTheme() {
    const userId = this.profile().id;
    if (!userId || !this.themeForm().html_template) return;
    this.store.dispatch({
      type: '[Templates] Preview Template',
      docType: this.themeDocType(),
      userId,
      html_template: this.themeForm().html_template
    });
  }

  saveThemeDetails() {
    const userId = this.profile().id;
    const { _id, ...themeData } = this.themeForm();
    if (this.isEditThemeMode() && _id) {
      this.store.dispatch({
        type: '[Templates] Update Template',
        docType: this.themeDocType(),
        id: _id,
        template: { ...themeData, userId }
      });
    } else {
      this.store.dispatch({
        type: '[Templates] Create Template',
        docType: this.themeDocType(),
        template: { ...themeData, userId }
      });
    }
    this.closeThemeDialog();
  }
}
