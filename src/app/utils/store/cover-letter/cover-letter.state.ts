import { CoverLetterInfo } from "../../entities/cover-letter";

export interface CoverLetterState {
    coverLetterInfoList: CoverLetterInfo[];
    selectedVersion: number;
    loading: boolean;
    error: string | null;
}
