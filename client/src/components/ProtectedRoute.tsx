import React from 'react';
import { useUser, RedirectToSignIn } from '@clerk/clerk-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isSignedIn, isLoaded, user } = useUser();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  if (allowedRoles && user) {
    const userRole = user.publicMetadata?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return <div>Unauthorized</div>;
    }
  }

  return <>{children}</>;
};
