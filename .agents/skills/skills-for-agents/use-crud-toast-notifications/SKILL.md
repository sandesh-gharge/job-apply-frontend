---
name: use-crud-toast-notifications
description: Enforce showing translated toast notifications after backend CRUD actions using the existing toast and translation skills.
---

# Use Toast Notifications for CRUD Operations

When a user action results in a backend CRUD operation, you MUST show a toast notification using the existing `use-toast-feature` skill.

## 1. Use translation first

Before displaying any toast, generate the message through the `TranslationService` using the `use-translation-service` skill.

### Example flow:
- user clicks a button to save data
- backend returns success or error
- translate the message with `TranslationService`
- show the toast with `ToastService`

## 2. Show success and error clearly

Use success to confirm completion and error to report failures.

### Examples:
- Save operation success: `this.toast.show(this.translate.t().someFeature.saveSuccess)`
- Save operation failure: `this.toast.show(this.translate.t().someFeature.saveFail, 'error')`
- Edit operation success: `this.toast.show(this.translate.t().someFeature.editSuccess)`
- Delete error: `this.toast.show(this.translate.t().someFeature.deleteFail, 'error')`

## 3. When this applies

Apply this guidance for any suitable frontend event that triggers a backend CRUD operation, such as:
- button clicks
- save operations
- edit/update actions
- delete operations
- form submission events

## 4. Implementation notes

- Do not hardcode user-facing notification text in components.
- Use translation keys from the translation dictionaries and update `fallback-en.ts` / JSON translation files as needed.
- Use the shared `ToastService` via `inject()`.
- Choose the toast `type` based on operation result: `'success'` for success, `'error'` for failures.
