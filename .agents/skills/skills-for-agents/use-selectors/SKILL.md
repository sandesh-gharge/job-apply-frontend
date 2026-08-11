---
name: use-selectors
description: Enforce using NgRx selectors for reading store state instead of inline store access in components and store setup.
---

# Use Selectors for Store Access

When accessing NgRx store state in this Angular project, do not query the store directly with inline state paths inside `selectSignal` or other selectors.

## 1. Prefer defined selectors

Always use named selectors imported from the store selector files.

### Avoid:
```typescript
selectedCvTemplateId = this.store.selectSignal((state: any) => state.templates.selectedCvTemplateId);
selectedClTemplateId = this.store.selectSignal((state: any) => state.templates.selectedClTemplateId);
```

### Use:
```typescript
selectedCvTemplateId = this.store.selectSignal(selectedCvTemplateId);
selectedClTemplateId = this.store.selectSignal(selectedClTemplateId);
```

## 2. When this skill applies

This guidance applies only when:
- you are reading a value from the store, or
- you are creating a new store access point in a component/service.

It does not apply to unrelated code or state mutations.

## 3. Benefits

- keeps component code decoupled from store shape
- centralizes state selection logic
- improves maintainability and enables reuse
- supports runtime type safety and easier refactoring

## 4. Implementation note

Add selectors to the appropriate `*.selector.ts` file for the feature state, then import and use them instead of inline functions.
