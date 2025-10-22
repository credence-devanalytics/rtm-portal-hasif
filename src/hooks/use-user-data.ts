import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string | null;
}

export function useUserData() {
  const { data: session, isPending: sessionPending } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserData() {
      if (!session?.user?.id) {
        console.log('No session user ID found');
        setUserData(null);
        setIsLoading(false);
        return;
      }

      console.log('Fetching user data for session:', session.user.id);
      
      try {
        const response = await fetch('/api/user', {
          credentials: 'include', // Include cookies
        });
        
        console.log('User API response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('User API error:', errorText);
          throw new Error(`Failed to fetch user data: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('User data received:', data);
        setUserData(data.user);
        setError(null);
      } catch (err) {
        console.error('Error in fetchUserData:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setUserData(null);
      } finally {
        setIsLoading(false);
      }
    }

    if (!sessionPending) {
      fetchUserData();
    }
  }, [session?.user?.id, sessionPending]);

  return {
    userData,
    isLoading: sessionPending || isLoading,
    error,
  };
}
