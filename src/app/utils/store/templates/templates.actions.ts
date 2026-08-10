import { createAction, props } from '@ngrx/store';
import { Template } from './templates.state';

// Fetch
export const loadTemplates = createAction(
  '[Templates] Load Templates',
  props<{ docType: 'cv' | 'cl', userId: string, includePublic: boolean }>()
);
export const loadTemplatesSuccess = createAction(
  '[Templates] Load Templates Success',
  props<{ docType: 'cv' | 'cl', templates: Template[] }>()
);
export const loadTemplatesFailure = createAction(
  '[Templates] Load Templates Failure',
  props<{ error: string }>()
);

// Create
export const createTemplate = createAction(
  '[Templates] Create Template',
  props<{ docType: 'cv' | 'cl', template: Omit<Template, '_id'> }>()
);
export const createTemplateSuccess = createAction(
  '[Templates] Create Template Success',
  props<{ docType: 'cv' | 'cl', template: Template }>()
);

// Update
export const updateTemplate = createAction(
  '[Templates] Update Template',
  props<{ docType: 'cv' | 'cl', id: string, template: Partial<Template> }>()
);
export const updateTemplateSuccess = createAction(
  '[Templates] Update Template Success',
  props<{ docType: 'cv' | 'cl', template: Template }>()
);

// Delete
export const deleteTemplate = createAction(
  '[Templates] Delete Template',
  props<{ docType: 'cv' | 'cl', id: string, userId: string }>()
);
export const deleteTemplateSuccess = createAction(
  '[Templates] Delete Template Success',
  props<{ docType: 'cv' | 'cl', id: string }>()
);


// Preview
export const previewTemplate = createAction(
  '[Templates] Preview Template',
  props<{ docType: 'cv' | 'cl', userId: string, html_template: string }>()
);
export const previewTemplateSuccess = createAction(
  '[Templates] Preview Template Success',
  props<{ renderedHtml: string }>()
);
export const clearPreview = createAction('[Templates] Clear Preview');

export const setSelectedCvTemplate = createAction(
  '[Templates] Set Selected CV Template',
  props<{ id: string | null }>()
);

export const setSelectedClTemplate = createAction(
  '[Templates] Set Selected CL Template',
  props<{ id: string | null }>()
);