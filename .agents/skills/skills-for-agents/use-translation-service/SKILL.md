---
name: use-translation-service
description: Instructs agents on how to add or alter UI content using the TranslationService and where to update the translation dictionaries.
---

# Using the TranslationService

JobApply relies on a custom TranslationService for i18n (internationalization). **Do not hardcode user-facing strings in HTML templates or TypeScript files.**

When you need to add or modify UI text, you must follow these steps:

## 1. Using Translations in Components
Inject the `TranslationService` as a `public` property in your component so it can be used in the template.

**TypeScript:**
```typescript
import { inject } from '@angular/core';
import { TranslationService } from '../utils/services/translation.service';

export class MyComponent {
  public translate = inject(TranslationService);
}
```

**HTML Template:**
Reference the string using the `t()` signal object:
```html
<!-- CORRECT -->
<button>{{ translate.t().common.save }}</button>

<!-- INCORRECT (Hardcoded) -->
<button>Save</button>
```

## 2. Updating Translation Files
Whenever you introduce a new translation key, you **MUST** update the dictionary files.

**Required Updates:**
1. **Fallback Dictionary:** Add the key and English text to `src/app/utils/services/translation/fallback-en.ts`. This acts as the offline fallback and TypeScript definition.
2. **Dynamic JSON Dictionaries:** Update the JSON files where dynamic translations are fetched from. Check for and update the JSON files in:
   - `public/temp/job-apply-translations/` (e.g., `en.json`, `de.json`)

Ensure the JSON structure exactly matches the structure in `fallback-en.ts`.

### Example Update
If you add a new title `dashboard.newFeature: 'My New Feature'`:

**In `fallback-en.ts`**:
```typescript
dashboard: {
  // ... existing keys ...
  newFeature: 'My New Feature'
}
```

**In `en.json` / `de.json`**:
```json
"dashboard": {
  "newFeature": "My New Feature"
}
```
