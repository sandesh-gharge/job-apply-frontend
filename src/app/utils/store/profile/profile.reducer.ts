import { createReducer, on } from "@ngrx/store";
import { ProfileInfoState } from "./profile.state";
import { clearProfileInfo, loadProfileInfo, loadProfileInfoFailure, loadProfileInfoSuccess, updateProfileInfo } from "./profile.actions";

export const initialProfileState: ProfileInfoState = {
    profileInfo: null,
    loading: false,
    error: null
};

export const profileReducer = createReducer(
    initialProfileState,

    on(loadProfileInfo, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(loadProfileInfoSuccess, (state, { profileInfo }) => ({
        ...state,
        profileInfo,
        loading: false,
        error: null
    })),

    on(loadProfileInfoFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    on(updateProfileInfo, (state, { profileInfo }) => ({
        ...state,
        profileInfo: { ...state.profileInfo, ...profileInfo }
    })),

    on(clearProfileInfo, () => ({
        ...initialProfileState
    })),
);
