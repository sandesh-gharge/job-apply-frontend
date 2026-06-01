import { createFeatureSelector, createSelector } from "@ngrx/store";
import { ProfileInfoState } from "./profile.state";

export const selectProfileState = createFeatureSelector<ProfileInfoState>('profile');

export const selectProfileInfo = createSelector(
    selectProfileState,
    (state: ProfileInfoState) => state.profileInfo
);

export const profileLocation = createSelector(
    selectProfileState,
    (state: ProfileInfoState) => state.profileInfo?.location
)

export const selectProfileLoading = createSelector(
    selectProfileState,
    (state: ProfileInfoState) => state.loading
);

export const selectProfileError = createSelector(
    selectProfileState,
    (state: ProfileInfoState) => state.error
);