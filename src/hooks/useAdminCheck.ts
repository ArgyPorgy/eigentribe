import { useState, useEffect } from 'react';

export function useAdminCheck(userEmail: string | undefined) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userEmail) {
      setIsAdmin(false);
      return;
    }

    const checkAdminStatus = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/.netlify/functions/check-admin?email=${encodeURIComponent(userEmail)}`);
        const data = await response.json();
        setIsAdmin(data.isAdmin || false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [userEmail]);

  return { isAdmin, loading };
}
