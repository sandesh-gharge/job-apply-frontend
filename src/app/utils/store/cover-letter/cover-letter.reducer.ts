import { createReducer, on } from "@ngrx/store";
import { CoverLetterState } from "./cover-letter.state";
import {
    loadCoverLetterInfo,
    loadCoverLetterInfoFailure,
    loadCoverLetterInfoSuccess,
    saveNewCoverLetterInfoFailure,
    saveNewCoverLetterInfoSuccess,
    setDefaultCoverLetterIndex,
    updateCoverLetterInfo,
    updateCoverLetterInfoFailure,
    updateCoverLetterInfoSuccess
} from "./cover-letter.actions";

export const initialCoverLetterState: CoverLetterState = {
    coverLetterInfoList: [],
    defaultIndex: 0,
    loading: false,
    error: null
};

export const coverLetterReducer = createReducer(
    initialCoverLetterState,

    on(loadCoverLetterInfo, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(loadCoverLetterInfoSuccess, (state, { coverLetterInfoList }) => ({
        ...state,
        coverLetterInfoList,
        loading: false
    })),

    on(loadCoverLetterInfoFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    on(updateCoverLetterInfo, (state) => ({
        ...state,
        loading: true
    })),

    on(updateCoverLetterInfoSuccess, (state, { coverLetterInfo }) => ({
        ...state,
        coverLetterInfoList: state.coverLetterInfoList.map(cl =>
            cl.id === coverLetterInfo.id ? coverLetterInfo : cl
        ),
        loading: false
    })),

    on(updateCoverLetterInfoFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    on(saveNewCoverLetterInfoSuccess, (state, { coverLetterInfo }) => ({
        ...state,
        coverLetterInfoList: [...state.coverLetterInfoList, coverLetterInfo]
    })),

    on(saveNewCoverLetterInfoFailure, (state, { error }) => ({
        ...state,
        error
    })),

    on(setDefaultCoverLetterIndex, (state, { index }) => ({
        ...state,
        defaultIndex: index
    })),
);
