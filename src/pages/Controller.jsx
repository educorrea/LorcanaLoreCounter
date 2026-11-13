import { Navigate } from "react-router-dom";

/** Compat: /controller → contador */
export default function Controller() {
  return <Navigate to="/" replace />;
}
