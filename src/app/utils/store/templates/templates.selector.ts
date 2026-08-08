import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TemplatesState } from './templates.state';

export const selectTemplatesState = createFeatureSelector<TemplatesState>('templates');

export const selectCvTemplates = createSelector(
  selectTemplatesState,
  (state: TemplatesState) => state.cvTemplates
);

export const selectClTemplates = createSelector(
  selectTemplatesState,
  (state: TemplatesState) => state.clTemplates
);


export const selectPreviewHtml = createSelector(
  selectTemplatesState,
  (state: TemplatesState) => state.previewHtml
);
