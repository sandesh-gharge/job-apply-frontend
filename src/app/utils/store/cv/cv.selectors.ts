import { createFeatureSelector, createSelector } from "@ngrx/store";
import { CVState } from "./cv.state";

export const selectCVState = createFeatureSelector<CVState>('cv');

export const selectCVInfoList = createSelector(
    selectCVState,
    (state: CVState) => state.cvInfoList
);

export const selectDefaultCVIndex = createSelector(
    selectCVState,
    (state: CVState) => state.defaultIndex
);

export const selectDefaultCV = createSelector(
    selectCVState,
    (state: CVState) => state.cvInfoList[state.defaultIndex] ?? null
);

export const selectCVLoading = createSelector(
    selectCVState,
    (state: CVState) => state.loading
);

export const selectCVError = createSelector(
    selectCVState,
    (state: CVState) => state.error
);
