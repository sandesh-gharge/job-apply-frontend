import { createReducer, on } from '@ngrx/store';
import { initialTemplatesState } from './templates.state';
import { clearPreview, createTemplateSuccess, deleteTemplateSuccess, loadTemplates, loadTemplatesFailure, loadTemplatesSuccess, previewTemplateSuccess, setSelectedClTemplate, setSelectedCvTemplate, updateTemplateSuccess } from './templates.actions';

export const templatesReducer = createReducer(
  initialTemplatesState,
  
  on(loadTemplates, (state) => ({ ...state, loading: true, error: null })),
  on(loadTemplatesSuccess, (state, { docType, templates }) => {
    return docType === 'cv' 
      ? { ...state, loading: false, cvTemplates: templates }
      : { ...state, loading: false, clTemplates: templates };
  }),
  on(loadTemplatesFailure, (state, { error }) => ({ ...state, loading: false, error })),
  
  on(createTemplateSuccess, (state, { docType, template }) => {
    return docType === 'cv'
      ? { ...state, cvTemplates: [...state.cvTemplates, template] }
      : { ...state, clTemplates: [...state.clTemplates, template] };
  }),

  on(updateTemplateSuccess, (state, { docType, template }) => {
    return docType === 'cv'
      ? { ...state, cvTemplates: state.cvTemplates.map(t => t._id === template._id ? template : t) }
      : { ...state, clTemplates: state.clTemplates.map(t => t._id === template._id ? template : t) };
  }),

  on(deleteTemplateSuccess, (state, { docType, id }) => {
    return docType === 'cv'
      ? { ...state, cvTemplates: state.cvTemplates.filter(t => t._id !== id) }
      : { ...state, clTemplates: state.clTemplates.filter(t => t._id !== id) };
  }),


  on(previewTemplateSuccess, (state, { renderedHtml }) => ({ ...state, previewHtml: renderedHtml })),
  on(clearPreview, (state) => ({ ...state, previewHtml: null })),

  on(setSelectedCvTemplate, (state, { id }) => ({ ...state, selectedCvTemplateId: id })),
  on(setSelectedClTemplate, (state, { id }) => ({ ...state, selectedClTemplateId: id }))
);
