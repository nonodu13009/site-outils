import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface ProduitCommission {
  id: string;
  nom: string;
  type_commission: string;
  // Ajoute ici d'autres champs utiles selon ta structure Firestore
  [key: string]: any;
}

export function useProduitsCommissions() {
  const [produits, setProduits] = useState<ProduitCommission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'produits_commissions'),
      (snapshot) => {
        setProduits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProduitCommission)));
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  return { produits, loading };
} 