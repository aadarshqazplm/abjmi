import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ requireAdmin = false }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();

  // Show a basic loader while Firebase checks the authentication state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-100 text-red-950">
        <span className="text-lg font-semibold tracking-widest animate-pulse">
          AUTHENTICATING...
        </span>
      </div>
    );
  }

  // If no user is logged in, kick them back to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If the route requires an admin but the user is just a standard role, send to home
  if (requireAdmin && role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // If all checks pass, render the child routes
  return <Outlet />;
}