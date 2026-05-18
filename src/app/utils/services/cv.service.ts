import { Injectable, inject } from '@angular/core';
import { BackendApiService } from '../backend-service/backend-api-services';
import { CvData, CVInfo } from '../entities/cv';

@Injectable({ providedIn: 'root' })
export class CvService {
  private backendApi = inject(BackendApiService);

  // CV Operations

  /**
   * Save a CV
   */
  async saveCV(cvInfo: CVInfo): Promise<any> {
    return this.backendApi.put('cv/' + cvInfo._id, cvInfo);
  }

  /**
   * Save CV as (create a copy)
   */
  async saveAsCV(cvInfo: CVInfo): Promise<any> {
    return this.backendApi.post('cv', cvInfo);
  }

  /**
   * Update a CV
   */
  async updateCV(id: string, cvData: CVInfo): Promise<any> {
    return this.backendApi.put(`/cvs/${id}`, cvData);
  }

  /**
   * Get a CV by ID
   */
  async getCV(id: string): Promise<any> {
    return this.backendApi.get(`/cvs/${id}`);
  }

  /**
   * Get all CVs
   */
  async getCVs(): Promise<CVInfo []> {
    return this.backendApi.get('/cvs');
  }

  /**
   * Delete a CV
   */
  async deleteCV(id: string): Promise<any> {
    return this.backendApi.delete(`/cvs/${id}`);
  }

  /**
   * Search CVs
   */
  async searchCVs(query: any): Promise<any> {
    return this.backendApi.post('/cvs/search', query);
  }
}