import { combineReducers, configureStore, type UnknownAction } from "@reduxjs/toolkit";
import sessionReducer from "./slices/sessionSlice";
import authReducer from "./slices/authSlice";
import loaderReducer from "./slices/loaderSlice";
import registrationReducer from "./slices/registrationSlice";
import recoveryReducer from "./slices/recoverySlice";

// Module-local declaration: bundlers (Vite/Metro) inline this literal at build time.
declare const process: { env: { NODE_ENV?: string } };

const appReducer = combineReducers({
  session: sessionReducer,
  auth: authReducer,
  loader: loaderReducer,
  registration: registrationReducer,
  recovery: recoveryReducer,
});

export type RootState = ReturnType<typeof appReducer>;

export const RESET_ALL = "app/resetAll";
export const resetAll = (): UnknownAction => ({ type: RESET_ALL });

/** RESET_ALL wipes every slice in one shot (logout, session timeout, idle) */
const rootReducer = (state: RootState | undefined, action: UnknownAction): RootState =>
  appReducer(action.type === RESET_ALL ? undefined : state, action);

export const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== "production",
});

export type AppDispatch = typeof store.dispatch;

export const selectIsAuthenticated = (s: RootState) =>
  s.session.sessionId !== "0" && s.session.isOtpVerified;
