---
name: use-toast-feature
description: Instructs subagents on how to use the predefined ToastService to display notifications to the user.
---

# Using the ToastService

Whenever you need to display a success, error, or informational message to the user after an action (like saving a form, deleting an item, or catching an error), you MUST use the existing `ToastService`.

## 1. Import Path
Always import the service from its correct utility path:
```typescript
import { ToastService } from '../utils/services/toast.service'; // adjust relative path as needed
```

## 2. Dependency Injection
Following the project's Angular 21 conventions, always use the `inject()` function to inject the service into your component, service, or NgRx Effect. Do NOT use constructor injection.
```typescript
import { inject } from '@angular/core';

export class MyComponent {
  private toastService = inject(ToastService);
}
```

## 3. Usage
The `ToastService` exposes a single `show` method. 
Signature: `show(message: string, type: ToastType = 'success', duration = 3000)`
The `type` can be `'success'`, `'error'`, or `'info'`.

### Examples:
**Success (Default type):**
```typescript
this.toastService.show('Profile updated successfully!');
```

**Error:**
```typescript
this.toastService.show('Failed to load jobs. Please try again.', 'error');
```

**Info:**
```typescript
this.toastService.show('Analyzing job description...', 'info');
```

## 4. Internationalization (i18n)
If the component uses the `TranslationService`, you should pass translated strings into the toast rather than hardcoding English strings.
```typescript
this.toastService.show(this.translate.t().messages.saveSuccess);
```
