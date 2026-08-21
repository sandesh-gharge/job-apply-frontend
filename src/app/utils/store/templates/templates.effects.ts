import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { TemplatesService } from '../../services/templates.service';
import { of } from 'rxjs';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { createTemplate, createTemplateSuccess, deleteTemplate, deleteTemplateSuccess, loadTemplates, loadTemplatesFailure, loadTemplatesSuccess, previewTemplate, previewTemplateSuccess, updateTemplate, updateTemplateSuccess } from './templates.actions';

@Injectable()
export class TemplatesEffects {
  private actions$ = inject(Actions);
  private templatesService = inject(TemplatesService);

  loadTemplates$ = createEffect(() => this.actions$.pipe(
    ofType(loadTemplates),
    mergeMap(({ docType, userId, includePublic }) =>
      this.templatesService.getTemplates(docType, userId, includePublic).pipe(
        map(templates => loadTemplatesSuccess({ docType, templates })),
        catchError(error => of(loadTemplatesFailure({ error: error.message })))
      )
    )
  ));

  createTemplate$ = createEffect(() => this.actions$.pipe(
    ofType(createTemplate),
    switchMap(({ docType, template }) =>
      this.templatesService.createTemplate(docType, template).pipe(
        map(newTemplate => createTemplateSuccess({ docType, template: newTemplate }))
        // Error handling can be added with ToastService if available
      )
    )
  ));

  updateTemplate$ = createEffect(() => this.actions$.pipe(
    ofType(updateTemplate),
    switchMap(({ docType, id, template }) =>
      this.templatesService.updateTemplate(docType, id, template).pipe(
        map(updatedTemplate => updateTemplateSuccess({ docType, template: updatedTemplate }))
      )
    )
  ));

  deleteTemplate$ = createEffect(() => this.actions$.pipe(
    ofType(deleteTemplate),
    switchMap(({ docType, id, userId }) =>
      this.templatesService.deleteTemplate(docType, id, userId).pipe(
        map(() => deleteTemplateSuccess({ docType, id }))
      )
    )
  ));

  previewTemplate$ = createEffect(() => this.actions$.pipe(
    ofType(previewTemplate),
    switchMap(({ docType, userId, html_template }) =>
      this.templatesService.previewTemplate(docType, userId, html_template).pipe(
        map(response => previewTemplateSuccess({ renderedHtml: response.rendered_html }))
      )
    )
  ));
}
