import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Template } from '../store/templates/templates.state';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TemplatesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.backendAiApiURL}templates`;

  getTemplates(docType: 'cv' | 'cl', userId: string, includePublic: boolean): Observable<Template[]> {
    return this.http.get<Template[]>(`${this.apiUrl}/${docType}/user/${userId}?includePublic=${includePublic}`);
  }

  createTemplate(docType: 'cv' | 'cl', template: Omit<Template, '_id'>): Observable<Template> {
    return this.http.post<Template>(`${this.apiUrl}/${docType}`, template);
  }

  updateTemplate(docType: 'cv' | 'cl', id: string, template: Partial<Template>): Observable<Template> {
    return this.http.put<Template>(`${this.apiUrl}/${docType}/${id}`, template);
  }

  deleteTemplate(docType: 'cv' | 'cl', id: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${docType}/${id}?userId=${userId}`);
  }

  previewTemplate(docType: 'cv' | 'cl', userId: string, html_template: string): Observable<{ rendered_html: string }> {
    return this.http.post<{ rendered_html: string }>(`${this.apiUrl}/preview`, {
      docType,
      userId,
      html_template
    });
  }
}
