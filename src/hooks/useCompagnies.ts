import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Compagnie {
  id: string;
  nom: string;
}

export function useCompagnies() {
  const [compagnies, setCompagnies] = useState<Compagnie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompagnies = async () => {
      setLoading(true);
      setError(null);
      try {
        const snap = await getDocs(collection(db, 'compagnies'));
        setCompagnies(snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) })));
      } catch (e) {
        setError('Erreur lors du chargement des compagnies');
      } finally {
        setLoading(false);
      }
    };
    fetchCompagnies();
  }, []);

  return { compagnies, loading, error };
} 