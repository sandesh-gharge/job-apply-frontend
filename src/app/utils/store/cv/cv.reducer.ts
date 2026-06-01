import { createReducer, on } from "@ngrx/store";
import { CVState } from "./cv.state";
import {
    loadCVInfo,
    loadCVInfoFailure,
    loadCVInfoSuccess,
    saveNewCVInfoFailure,
    saveNewCVInfoSuccess,
    setDefaultCVIndex,
    updateCVInfo,
    updateCVInfoFailure,
    updateCVInfoSuccess
} from "./cv.actions";

export const initialCVState: CVState = {
    cvInfoList: [],
    defaultIndex: 0,
    loading: false,
    error: null
};

export const cvReducer = createReducer(
    initialCVState,

    on(loadCVInfo, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(loadCVInfoSuccess, (state, { cvInfoList }) => ({
        ...state,
        cvInfoList,
        loading: false
    })),

    on(loadCVInfoFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    on(updateCVInfo, (state) => ({
        ...state,
        loading: true
    })),

    on(updateCVInfoSuccess, (state, { cvInfo }) => ({
        ...state,
        cvInfoList: state.cvInfoList.map(cv => cv.id === cvInfo.id ? cvInfo : cv),
        loading: false
    })),

    on(updateCVInfoFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    on(saveNewCVInfoSuccess, (state, { cvInfo }) => ({
        ...state,
        cvInfoList: [...state.cvInfoList, cvInfo]
    })),

    on(saveNewCVInfoFailure, (state, { error }) => ({
        ...state,
        error
    })),

    on(setDefaultCVIndex, (state, { index }) => ({
        ...state,
        defaultIndex: index
    })),
);
