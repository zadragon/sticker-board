import React from "react";
import { Navigate, useLocation } from "react-router-dom";

interface ParentAuthRouteProps {
  children: React.ReactNode;
}

const ParentAuthRoute = ({ children }: ParentAuthRouteProps) => {
  const isAuth = sessionStorage.getItem("isParentAuthenticated") === "true";
  const location = useLocation();

  if (!isAuth) {
    // 인증되지 않았다면 pin-check로 보내고,
    // 원래 가려던 주소(location.pathname)를 state에 저장합니다.
    return (
      <Navigate to="/parent-auth" state={{ from: location.pathname }} replace />
    );
  }

  return <>{children}</>;
};

export default ParentAuthRoute;
