import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string | null;
}

interface UserAccess {
  socMedAcc: boolean;
  socMedSent: boolean;
  rtmklik: boolean;
  mytv: boolean;
  astro: boolean;
  unifitv: boolean;
  wartaberita: boolean;
  marketing: boolean;
  permission: string;
}

export function useUserData() {
  const { data: session, isPending: sessionPending } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userAccess, setUserAccess] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserAccess = async (userId: string): Promise<string[]> => {
    try {
      const response = await fetch(`/api/user/access?userId=${userId}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        console.error('User access API error:', response.status);
        return [];
      }
      
      const data = await response.json();
      console.log('User access data received:', data);
      
      // Map database boolean columns to page keys
      const accessMapping: { [key: string]: string } = {
        socMedAcc: 'SocMedAcc',
        socMedSent: 'SocMedSent', 
        rtmklik: 'RTMClick',
        mytv: 'MyTV',
        astro: 'ASTRO',
        unifitv: 'UnifiTV',
        wartaberita: 'Berita',
        marketing: 'Marketing'
      };
      
      const permissions: string[] = [];
      if (data.access) {
        Object.entries(data.access).forEach(([dbColumn, hasAccess]) => {
          if (hasAccess && accessMapping[dbColumn]) {
            permissions.push(accessMapping[dbColumn]);
          }
        });
      }
      
      return permissions;
    } catch (err) {
      console.error('Error fetching user access:', err);
      return [];
    }
  };

  useEffect(() => {
    async function fetchUserData() {
      if (!session?.user?.id) {
        console.log('No session user ID found');
        setUserData(null);
        setUserAccess([]);
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
        
        // Fetch user access permissions
        const permissions = await fetchUserAccess(session.user.id);
        setUserAccess(permissions);
        
        setError(null);
      } catch (err) {
        console.error('Error in fetchUserData:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setUserData(null);
        setUserAccess([]);
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
    userAccess,
    fetchUserAccess,
    isLoading: sessionPending || isLoading,
    error,
  };
}
