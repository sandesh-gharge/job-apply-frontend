import { createAction, props } from "@ngrx/store";
import { CVInfo } from "../../entities/cv";

/**
 * CV Info Actions
 */
export const loadCVInfo = createAction(
    '[CV] Load CV Info',
    props<{ userId: string }>()
);

export const loadCVInfoSuccess = createAction(
    '[CV] Load CV Info Success',
    props<{ cvInfoList: CVInfo[] }>()
);

export const loadCVInfoFailure = createAction(
    '[CV] Load CV Info Failure',
    props<{ error: string }>()
);

export const updateCVInfo = createAction(
    '[CV] Update CV Info',
    props<{ cvInfo: CVInfo }>()
);

export const updateCVInfoSuccess = createAction(
    '[CV] Update CV Info Success',
    props<{ cvInfo: CVInfo }>()
);

export const updateCVInfoFailure = createAction(
    '[CV] Update CV Info Failure',
    props<{ error: string }>()
);

export const saveNewCVInfo = createAction(
    '[CV] Save New CV Info',
    props<{ cvInfo: CVInfo }>()
);

export const saveNewCVInfoSuccess = createAction(
    '[CV] Save New CV Info Success',
    props<{ cvInfo: CVInfo }>()
);

export const saveNewCVInfoFailure = createAction(
    '[CV] Save New CV Info Failure',
    props<{ error: string }>()
);

export const selectCVVersion = createAction(
    '[CV] Select CV Version',
    props<{ version: number }>()
);

export const deleteCVInfo = createAction(
    '[CV] Delete CV Info',
    props<{ id: string }>()
);

export const deleteCVInfoSuccess = createAction(
    '[CV] Delete CV Info Success',
    props<{ id: string }>()
);

export const deleteCVInfoFailure = createAction(
    '[CV] Delete CV Info Failure',
    props<{ error: string }>()
);