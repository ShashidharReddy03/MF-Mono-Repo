import { Navigate, Outlet } from "react-router-dom";
import { selectIsAuthenticated, useAppSelector } from "@mf-bank/shared";
import { ROUTES } from "./routes";

/** Private area gate: session id + OTP verified, both held only in memory */
const RequireAuth = () => {
  const isAuth = useAppSelector(selectIsAuthenticated);
  return isAuth ? <Outlet /> : <Navigate to={ROUTES.public.login} replace />;
};

export default RequireAuth;
