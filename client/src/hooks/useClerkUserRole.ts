import { useUser } from '@clerk/clerk-react';

export const useClerkUserRole = () => {
  const { user, isLoaded } = useUser();
  if (!isLoaded || !user) {
    return null;
  }
  return user.publicMetadata.role || null;
};
