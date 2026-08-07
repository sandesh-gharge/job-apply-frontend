import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HealthResponse {
  status: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class DemoTaskService {
  private http = inject(HttpClient);

  checkHealth(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>('/api/health');
  }
}
