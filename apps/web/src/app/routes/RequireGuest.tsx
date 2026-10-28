import { Navigate, Outlet } from "react-router-dom";
import { selectIsAuthenticated, useAppSelector } from "@mf-bank/shared";
import { ROUTES } from "./routes";

/** Logged-in users never see login/registration pages */
const RequireGuest = () => {
  const isAuth = useAppSelector(selectIsAuthenticated);
  return isAuth ? <Navigate to={ROUTES.private.dashboard} replace /> : <Outlet />;
};

export default RequireGuest;
