import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';

export interface UserProfile {
  id: string;
  prenom: string;
  nom: string;
  mail: string;
  role: string;
  role_label: string;
  genre?: string;
  present?: boolean;
}

export function useUserProfile() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setProfile(snap.data() as UserProfile);
        } else {
          // Création automatique si le doc n'existe pas
          const newProfile: UserProfile = {
            id: user.uid,
            prenom: user.displayName?.split(' ')[0] || '',
            nom: user.displayName?.split(' ')[1] || '',
            mail: user.email || '',
            role: 'utilisateur',
            role_label: 'Utilisateur',
          };
          await setDoc(ref, newProfile);
          setProfile(newProfile);
        }
      } catch (e) {
        setError('Erreur lors de la récupération du profil utilisateur.');
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  return { profile, loading: loading || authLoading, error };
} 