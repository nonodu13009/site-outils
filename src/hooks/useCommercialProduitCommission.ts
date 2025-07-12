import { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface CommercialProduitCommission {
  id: string;
  produit: string;
  label: string;
  type: 'fixe' | 'variable';
  valeur: number;
  boost?: {
    type: 'fixe' | 'variable';
    valeur: number;
    periode: {
      debut: Date;
      fin: Date;
    };
  };
  duree?: {
    debut: Date;
    fin: Date;
  };
  actif: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function useCommercialProduitCommission() {
  const [commissions, setCommissions] = useState<CommercialProduitCommission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommissions = async () => {
      setLoading(true);
      setError(null);
      try {
        const snap = await getDocs(query(collection(db, 'commercial_produit_commission'), orderBy('produit')));
        const commissionsData = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as CommercialProduitCommission[];
        setCommissions(commissionsData);
      } catch (e) {
        setError('Erreur lors du chargement des commissions');
        console.error('Erreur fetchCommissions:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchCommissions();
  }, []);

  const addCommission = async (commission: Omit<CommercialProduitCommission, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'commercial_produit_commission'), {
        ...commission,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (e) {
      throw new Error('Erreur lors de l\'ajout de la commission');
    }
  };

  const updateCommission = async (id: string, updates: Partial<CommercialProduitCommission>) => {
    try {
      await updateDoc(doc(db, 'commercial_produit_commission', id), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      throw new Error('Erreur lors de la mise à jour de la commission');
    }
  };

  const deleteCommission = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'commercial_produit_commission', id));
    } catch (e) {
      throw new Error('Erreur lors de la suppression de la commission');
    }
  };

  return { 
    commissions, 
    loading, 
    error, 
    addCommission, 
    updateCommission, 
    deleteCommission 
  };
} 