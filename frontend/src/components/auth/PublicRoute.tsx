import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const PublicRoute = () => {
  const { isAuth } = useAuth();

  if (isAuth) return <Navigate to="/" replace />;

  return <Outlet />;
};

export default PublicRoute;
