import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { TemplatesService } from '../../services/templates.service';
import * as TemplatesActions from './templates.actions';
import { of } from 'rxjs';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';

@Injectable()
export class TemplatesEffects {
  private actions$ = inject(Actions);
  private templatesService = inject(TemplatesService);

  loadTemplates$ = createEffect(() => this.actions$.pipe(
    ofType(TemplatesActions.loadTemplates),
    mergeMap(({ docType, userId, includePublic }) =>
      this.templatesService.getTemplates(docType, userId, includePublic).pipe(
        map(templates => TemplatesActions.loadTemplatesSuccess({ docType, templates })),
        catchError(error => of(TemplatesActions.loadTemplatesFailure({ error: error.message })))
      )
    )
  ));

  createTemplate$ = createEffect(() => this.actions$.pipe(
    ofType(TemplatesActions.createTemplate),
    switchMap(({ docType, template }) =>
      this.templatesService.createTemplate(docType, template).pipe(
        map(newTemplate => TemplatesActions.createTemplateSuccess({ docType, template: newTemplate }))
        // Error handling can be added with ToastService if available
      )
    )
  ));

  updateTemplate$ = createEffect(() => this.actions$.pipe(
    ofType(TemplatesActions.updateTemplate),
    switchMap(({ docType, id, template }) =>
      this.templatesService.updateTemplate(docType, id, template).pipe(
        map(updatedTemplate => TemplatesActions.updateTemplateSuccess({ docType, template: updatedTemplate }))
      )
    )
  ));

  deleteTemplate$ = createEffect(() => this.actions$.pipe(
    ofType(TemplatesActions.deleteTemplate),
    switchMap(({ docType, id, userId }) =>
      this.templatesService.deleteTemplate(docType, id, userId).pipe(
        map(() => TemplatesActions.deleteTemplateSuccess({ docType, id }))
      )
    )
  ));

  previewTemplate$ = createEffect(() => this.actions$.pipe(
    ofType(TemplatesActions.previewTemplate),
    switchMap(({ docType, userId, html_template }) =>
      this.templatesService.previewTemplate(docType, userId, html_template).pipe(
        map(response => TemplatesActions.previewTemplateSuccess({ renderedHtml: response.rendered_html }))
      )
    )
  ));
}
