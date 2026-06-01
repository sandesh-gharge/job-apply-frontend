import { CVInfo } from "../../entities/cv";

export interface CVState {
    cvInfoList: CVInfo[];
    defaultIndex: number;
    loading: boolean;
    error: string | null;
}
