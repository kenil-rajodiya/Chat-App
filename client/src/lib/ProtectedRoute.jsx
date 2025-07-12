// src/lib/ProtectedRoute.jsx
import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.jsx";

export default function ProtectedRoute() {
  const { authUser, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="p-4">Checking authentication…</div>;
  }

  if (!authUser) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
