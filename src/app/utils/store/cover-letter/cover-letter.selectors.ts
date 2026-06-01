import { createFeatureSelector, createSelector } from "@ngrx/store";
import { CoverLetterState } from "./cover-letter.state";

export const selectCoverLetterState = createFeatureSelector<CoverLetterState>('coverLetter');

export const selectCoverLetterInfoList = createSelector(
    selectCoverLetterState,
    (state: CoverLetterState) => state.coverLetterInfoList
);

export const selectDefaultCoverLetterIndex = createSelector(
    selectCoverLetterState,
    (state: CoverLetterState) => state.defaultIndex
);

export const selectDefaultCoverLetter = createSelector(
    selectCoverLetterInfoList,
    selectDefaultCoverLetterIndex,
    (list, index) => list?.[index] ?? null
);

export const selectCoverLetterLoading = createSelector(
    selectCoverLetterState,
    (state: CoverLetterState) => state.loading
);

export const selectCoverLetterError = createSelector(
    selectCoverLetterState,
    (state: CoverLetterState) => state.error
);
