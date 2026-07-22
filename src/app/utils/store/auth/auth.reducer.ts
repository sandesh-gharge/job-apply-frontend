import { createReducer, on } from "@ngrx/store";
import { AuthState } from "./auth.state";
import { autoLogin, login, loginFailure, loginSuccess, logout } from "./auth.actions";

export const initialAuthState: AuthState = {
    user: null,
    token: null,
    loading: false,
    autoLoginLoading: false,
    error: null,
    isAuthenticated: false
};

export const authReducer = createReducer(
    initialAuthState,
    on(autoLogin, state => ({
        ...state,
        loading: false,
        autoLoginLoading: true,
        error: null
    })),

    on(login, state => ({
        ...state,
        loading: true,
        autoLoginLoading: false,
        error: null
    })),

    on(loginSuccess, (state, { user, token }) => ({
        ...state,
        user,
        token,
        loading: false,
        autoLoginLoading: false,
        isAuthenticated: true
    })),

    on(loginFailure, (state, { error }) => ({
        ...state,
        loading: false,
        autoLoginLoading: false,
        error,
        isAuthenticated: false
    })),

    on(logout, state => ({
        ...state,
        user: null,
        token: null,
        loading: false,
        autoLoginLoading: false,
        isAuthenticated: false
    }))
);