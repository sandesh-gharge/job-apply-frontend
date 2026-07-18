import { createReducer, on } from '@ngrx/store';
import { ApplyWizardState } from './apply-wizard.state';
import {
  setWizardTab,
  addLoadingFlag,
  removeLoadingFlag,
  clearAllLoadingFlags,
  setJobUrl,
  setJobDescription,
  fetchJobFromUrl,
  fetchJobFromUrlSuccess,
  fetchJobFromUrlFailure,
  extractJobDetails,
  extractJobDetailsSuccess,
  extractJobDetailsFailure,
  setJobDetails,
  updateJobDetailsField,
  resetJobDetails,
  setCoverLetterInfo,
  clearCoverLetterInfo,
  setCvDetails,
  clearCvDetails,
  resetWizard
} from './apply-wizard.actions';

export const initialApplyWizardState: ApplyWizardState = {
  currentTab: 'Fetch Job',
  loadingFlags: {},
  jobDetails: null,
  coverLetterInfo: null,
  cvDetails: null,
  jobUrl: '',
  jobDescription: '',
  error: null
};

export const applyWizardReducer = createReducer(
  initialApplyWizardState,

  // ─── Tab Navigation ───────────────────────────────────────────────────
  on(setWizardTab, (state, { tab }) => ({
    ...state,
    currentTab: tab
  })),

  // ─── Loading Flags ────────────────────────────────────────────────────
  on(addLoadingFlag, (state, { key, messageKey }) => ({
    ...state,
    loadingFlags: { ...state.loadingFlags, [key]: messageKey }
  })),

  on(removeLoadingFlag, (state, { key }) => {
    const { [key]: _removed, ...rest } = state.loadingFlags;
    return { ...state, loadingFlags: rest };
  }),

  on(clearAllLoadingFlags, (state) => ({
    ...state,
    loadingFlags: {}
  })),

  // ─── Job URL & Description ─────────────────────────────────────────────
  on(setJobUrl, (state, { url }) => ({ ...state, jobUrl: url })),
  on(setJobDescription, (state, { description }) => ({ ...state, jobDescription: description })),

  // ─── Fetch Job From URL ────────────────────────────────────────────────
  on(fetchJobFromUrl, (state) => ({
    ...state,
    error: null
  })),

  on(fetchJobFromUrlSuccess, (state, { url, description }) => ({
    ...state,
    jobUrl: url,
    jobDescription: description,
    error: null
  })),

  on(fetchJobFromUrlFailure, (state, { error }) => ({
    ...state,
    error
  })),

  // ─── Extract Job Details ───────────────────────────────────────────────
  on(extractJobDetails, (state) => ({
    ...state,
    error: null
  })),

  on(extractJobDetailsSuccess, (state, { jobDetails }) => ({
    ...state,
    jobDetails,
    error: null
  })),

  on(extractJobDetailsFailure, (state, { error }) => ({
    ...state,
    error
  })),

  // ─── Job Details ──────────────────────────────────────────────────────
  on(setJobDetails, (state, { jobDetails }) => ({
    ...state,
    jobDetails
  })),

  on(updateJobDetailsField, (state, { key, value }) => ({
    ...state,
    jobDetails: state.jobDetails
      ? { ...state.jobDetails, [key]: value }
      : null
  })),

  on(resetJobDetails, (state) => ({
    ...state,
    jobDetails: null
  })),

  // ─── Cover Letter Info ─────────────────────────────────────────────
  on(setCoverLetterInfo, (state, { coverLetterInfo }) => ({
    ...state,
    coverLetterInfo
  })),

  on(clearCoverLetterInfo, (state) => ({
    ...state,
    coverLetterInfo: null
  })),

  // ─── CV Details ───────────────────────────────────────────────────────
  on(setCvDetails, (state, { cvDetails }) => ({
    ...state,
    cvDetails
  })),

  on(clearCvDetails, (state) => ({
    ...state,
    cvDetails: null
  })),

  // ─── Reset ────────────────────────────────────────────────────────────
  on(resetWizard, () => ({ ...initialApplyWizardState }))
);
