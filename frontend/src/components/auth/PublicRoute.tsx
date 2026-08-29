import { Navigate, Outlet } from "react-router-dom";
// Update this path to wherever your useAuth hook is!
import { useAuth } from "../../hooks/useAuth"; 
import Loading from "../ui/Loading";

const PublicRoute = () => {
  const { isAuth, loading } = useAuth();

  if (loading) return <Loading />;


  if (isAuth) return <Navigate to="/" replace />;

  return <Outlet />;
};

export default PublicRoute;