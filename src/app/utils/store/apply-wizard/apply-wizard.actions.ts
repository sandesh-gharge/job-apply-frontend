import { createAction, props } from '@ngrx/store';
import { JobDetails } from '../../entities/job-details';
import { CoverLetterInfo } from '../../entities/cover-letter';
import { CVInfo } from '../../entities/cv';
import { WizardTabId } from './apply-wizard.state';

// ─── Tab Navigation ───────────────────────────────────────────
export const setWizardTab = createAction(
  '[Apply Wizard] Set Tab',
  props<{ tab: WizardTabId }>()
);

// ─── Loading Flags ────────────────────────────────────────────
/**
 * Add a loading entry. key = unique id, messageKey = i18n translation key
 * e.g. { key: 'fetchJob', messageKey: 'applyWizard.loadingFetchJob' }
 */
export const addLoadingFlag = createAction(
  '[Apply Wizard] Add Loading Flag',
  props<{ key: string; messageKey: string }>()
);

export const removeLoadingFlag = createAction(
  '[Apply Wizard] Remove Loading Flag',
  props<{ key: string }>()
);

export const clearAllLoadingFlags = createAction(
  '[Apply Wizard] Clear All Loading Flags'
);

// ─── Job URL & Description ─────────────────────────────────────
export const setJobUrl = createAction(
  '[Apply Wizard] Set Job URL',
  props<{ url: string }>()
);

export const setJobDescription = createAction(
  '[Apply Wizard] Set Job Description',
  props<{ description: string }>()
);

// ─── Fetch Job from URL ────────────────────────────────────────
export const fetchJobFromUrl = createAction(
  '[Apply Wizard] Fetch Job From URL',
  props<{ url: string }>()
);

export const fetchJobFromUrlSuccess = createAction(
  '[Apply Wizard] Fetch Job From URL Success',
  props<{ url: string; description: string }>()
);

export const fetchJobFromUrlFailure = createAction(
  '[Apply Wizard] Fetch Job From URL Failure',
  props<{ error: string }>()
);

// ─── Extract Job Details (AI Parsing) ─────────────────────────
export const extractJobDetails = createAction(
  '[Apply Wizard] Extract Job Details',
  props<{ jobDescription: string }>()
);

export const extractJobDetailsSuccess = createAction(
  '[Apply Wizard] Extract Job Details Success',
  props<{ jobDetails: JobDetails }>()
);

export const extractJobDetailsFailure = createAction(
  '[Apply Wizard] Extract Job Details Failure',
  props<{ error: string }>()
);

// ─── Job Details (direct set/update) ─────────────────────────
export const setJobDetails = createAction(
  '[Apply Wizard] Set Job Details',
  props<{ jobDetails: JobDetails }>()
);

export const updateJobDetailsField = createAction(
  '[Apply Wizard] Update Job Details Field',
  props<{ key: string; value: any }>()
);

export const resetJobDetails = createAction(
  '[Apply Wizard] Reset Job Details'
);

// ─── Cover Letter Info ──────────────────────────────────────
export const setCoverLetterInfo = createAction(
  '[Apply Wizard] Set Cover Letter Info',
  props<{ coverLetterInfo: CoverLetterInfo }>()
);

export const clearCoverLetterInfo = createAction(
  '[Apply Wizard] Clear Cover Letter Info'
);

// ─── CV Details ────────────────────────────────────────────────
export const setCvDetails = createAction(
  '[Apply Wizard] Set CV Details',
  props<{ cvDetails: CVInfo }>()
);

export const clearCvDetails = createAction(
  '[Apply Wizard] Clear CV Details'
);

// ─── Reset entire wizard ───────────────────────────────────────
export const resetWizard = createAction(
  '[Apply Wizard] Reset'
);
