import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ROUTES } from "../constants/routes";

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useContext(AuthContext);

  // While authentication state is being restored (e.g. after refresh),
  // do not render or redirect yet.
  if (isLoading) {
    return null; // or a loading spinner if you want
  }

  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // User is authenticated → render protected content
  return children;
}

export default ProtectedRoute;
