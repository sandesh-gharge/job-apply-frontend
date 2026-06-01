import { ProfileInfo } from "../../entities/user";

export interface ProfileInfoState {
    profileInfo: ProfileInfo | null;
    loading: boolean;
    error: string | null;
}