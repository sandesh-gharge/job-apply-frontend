import { createReducer, on } from '@ngrx/store';
import { initialTemplatesState, TemplatesState } from './templates.state';
import * as TemplatesActions from './templates.actions';

export const templatesReducer = createReducer(
  initialTemplatesState,
  
  on(TemplatesActions.loadTemplates, (state) => ({ ...state, loading: true, error: null })),
  on(TemplatesActions.loadTemplatesSuccess, (state, { docType, templates }) => {
    return docType === 'cv' 
      ? { ...state, loading: false, cvTemplates: templates }
      : { ...state, loading: false, clTemplates: templates };
  }),
  on(TemplatesActions.loadTemplatesFailure, (state, { error }) => ({ ...state, loading: false, error })),
  
  on(TemplatesActions.createTemplateSuccess, (state, { docType, template }) => {
    return docType === 'cv'
      ? { ...state, cvTemplates: [...state.cvTemplates, template] }
      : { ...state, clTemplates: [...state.clTemplates, template] };
  }),

  on(TemplatesActions.updateTemplateSuccess, (state, { docType, template }) => {
    return docType === 'cv'
      ? { ...state, cvTemplates: state.cvTemplates.map(t => t._id === template._id ? template : t) }
      : { ...state, clTemplates: state.clTemplates.map(t => t._id === template._id ? template : t) };
  }),

  on(TemplatesActions.deleteTemplateSuccess, (state, { docType, id }) => {
    return docType === 'cv'
      ? { ...state, cvTemplates: state.cvTemplates.filter(t => t._id !== id) }
      : { ...state, clTemplates: state.clTemplates.filter(t => t._id !== id) };
  }),

  on(TemplatesActions.setSelectedCvTemplate, (state, { id }) => ({ ...state, selectedCvTemplateId: id })),
  on(TemplatesActions.setSelectedClTemplate, (state, { id }) => ({ ...state, selectedClTemplateId: id })),
  
  on(TemplatesActions.previewTemplateSuccess, (state, { renderedHtml }) => ({ ...state, previewHtml: renderedHtml })),
  on(TemplatesActions.clearPreview, (state) => ({ ...state, previewHtml: null }))
);
