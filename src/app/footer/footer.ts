import { Component, inject, computed } from '@angular/core';
import { TranslationService } from '@app/utils/services/translation/translation.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class FooterComponent {
  public translate = inject(TranslationService);
  
  public currentLanguageName = computed(() => {
    const code = this.translate.currentLang();
    const langs = this.translate.languages();
    const lang = langs.find(l => l.code === code);
    return lang ? lang.name : code;
  });
}
