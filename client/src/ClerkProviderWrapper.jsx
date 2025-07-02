import React from 'react';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const RoleRedirect = ({ children }) => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isLoaded && user) {
      const role = user.publicMetadata.role;
      if (role === 'admin') {
        navigate('/admin-dashboard');
      } else if (role === 'reader') {
        navigate('/reader-dashboard');
      } else if (role === 'client') {
        navigate('/client-dashboard');
      }
    }
  }, [isLoaded, user, navigate]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return children;
};

const ClerkProviderWrapper = ({ children }) => {
  return (
    <ClerkProvider publishableKey={clerkPubKey} navigate={(to) => window.history.pushState(null, '', to)}>
      <SignedIn>
        <RoleRedirect>{children}</RoleRedirect>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </ClerkProvider>
  );
};

export default ClerkProviderWrapper;
