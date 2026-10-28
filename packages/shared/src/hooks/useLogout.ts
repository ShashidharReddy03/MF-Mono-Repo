import { useCallback } from "react";
import { logout } from "../api/services/common.api";
import { resetAll } from "../store/store";
import { useAppDispatch } from "./hooks";

/** Tell the server, then wipe ALL client state regardless of the outcome */
export const useLogout = () => {
  const dispatch = useAppDispatch();
  return useCallback(async () => {
    try {
      await logout();
    } catch {
      /* ignore — we log out locally anyway */
    } finally {
      dispatch(resetAll());
    }
  }, [dispatch]);
};
