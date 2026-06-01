import { CoverLetterInfo } from "../../entities/cover-letter";

export interface CoverLetterState {
    coverLetterInfoList: CoverLetterInfo[];
    defaultIndex: number;
    loading: boolean;
    error: string | null;
}
