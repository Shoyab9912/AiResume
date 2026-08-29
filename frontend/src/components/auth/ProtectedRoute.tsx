import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth"; 
import Loading from "../ui/Loading";

const ProtectedRoute = () => {
  const { isAuth, loading } = useAuth();
  if (loading) return <Loading />; 
  if (!isAuth) return <Navigate to="/login" replace />;
  
  return <Outlet />;
};

export default ProtectedRoute;