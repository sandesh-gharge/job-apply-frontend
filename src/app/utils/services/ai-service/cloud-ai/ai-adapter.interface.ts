import { Observable } from 'rxjs';
import { AiProvider, AiProviderConfig, AiRequest, AiResponse } from './ai-provider.model';
import { HttpClient } from '@angular/common/http';
import { inject, InjectionToken } from '@angular/core';

export const AI_ADAPTERS = new InjectionToken<AiAdapter[]>('AI_ADAPTERS');

/**
 * Every provider adapter must implement this interface.
 *
 * The adapter is responsible for:
 *  1. Translating the normalised {@link AiRequest} into the provider-specific
 *     HTTP request body.
 *  2. Making the HTTP call via Angular's HttpClient.
 *  3. Mapping the raw provider response back to a normalised {@link AiResponse}.
 */
export abstract class AiAdapter {
  protected http = inject(HttpClient);

  abstract supports(provider: AiProvider): boolean;
  abstract generate(request: AiRequest, config: AiProviderConfig, provider: AiProvider): Observable<AiResponse>;
}
