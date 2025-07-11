import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange, getCurrentUser } from '@/lib/auth';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Vérifier l'utilisateur actuel immédiatement
    const currentUser = getCurrentUser();
    if (currentUser) {
      setAuthState({
        user: currentUser,
        loading: false,
        error: null,
      });
    }

    // Écouter les changements d'état d'authentification
    const unsubscribe = onAuthStateChange((user) => {
      setAuthState({
        user,
        loading: false,
        error: null,
      });
    });

    // Nettoyer l'écouteur lors du démontage du composant
    return () => unsubscribe();
  }, []);

  return authState;
}; 