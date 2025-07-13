import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface CommercialProduitCommission {
  id: string;
  nom: string;
  description: string;
  type_commission: 'fixe' | 'variable' | 'progressive';
  commission: {
    montant?: number;
    pourcentage?: number;
    base?: number;
    tranche_supplementaire?: number;
    seuil_tranche?: number;
    seuil_debut?: number;
  };
  actif: boolean;
  date_creation: Date;
  date_modification: Date;
}

export function useCommercialProduitCommission() {
  const [commissions, setCommissions] = useState<CommercialProduitCommission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Écoute en temps réel avec onSnapshot
    const q = query(collection(db, 'produits_commissions'), orderBy('nom'));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const commissionsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date_creation: doc.data().date_creation?.toDate() || new Date(),
          date_modification: doc.data().date_modification?.toDate() || new Date(),
        })) as CommercialProduitCommission[];
        
        setCommissions(commissionsData);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Erreur onSnapshot:', error);
        setError('Erreur lors du chargement des commissions');
        setLoading(false);
      }
    );

    // Cleanup function pour éviter les fuites mémoire
    return () => unsubscribe();
  }, []);

  const addCommission = async (commission: Omit<CommercialProduitCommission, 'id' | 'date_creation' | 'date_modification'>) => {
    try {
      const docRef = await addDoc(collection(db, 'produits_commissions'), {
        ...commission,
        date_creation: serverTimestamp(),
        date_modification: serverTimestamp(),
      });
      return docRef.id;
    } catch (e) {
      console.error('Erreur addCommission:', e);
      throw new Error('Erreur lors de l\'ajout de la commission');
    }
  };

  const updateCommission = async (id: string, updates: Partial<CommercialProduitCommission>) => {
    try {
      await updateDoc(doc(db, 'produits_commissions', id), {
        ...updates,
        date_modification: serverTimestamp(),
      });
    } catch (e) {
      console.error('Erreur updateCommission:', e);
      throw new Error('Erreur lors de la mise à jour de la commission');
    }
  };

  const deleteCommission = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'produits_commissions', id));
    } catch (e) {
      console.error('Erreur deleteCommission:', e);
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