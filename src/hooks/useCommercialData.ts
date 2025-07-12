import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import { CommercialData } from '@/components/CommercialTable';

export function useCommercialData() {
  const { user } = useAuth();
  const [data, setData] = useState<CommercialData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setData([]);
      setLoading(false);
      return;
    }

    const fetchCommercialData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Récupérer les contrats de l'utilisateur connecté
        const contratsRef = collection(db, 'contrats');
        const q = query(
          contratsRef,
          where('user_id', '==', user.uid),
          orderBy('date_saisie', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const contratsData: CommercialData[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          contratsData.push({
            id: doc.id,
            date_saisie: data.date_saisie || '',
            nom_client: data.nom_client || '',
            num_contrat: data.num_contrat || '',
            date_effet: data.date_effet || '',
            process: data.process || '',
            produit: data.produit || '',
            compagnie: data.compagnie || '',
            ca_vl: data.ca_vl || 0,
            ca_mensuel: data.ca_mensuel || 0,
            comm_potentielle: data.comm_potentielle || 0,
          });
        });
        
        setData(contratsData);
      } catch (e) {
        console.error('Erreur lors de la récupération des données commerciales:', e);
        setError('Erreur lors du chargement des données');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCommercialData();
  }, [user]);

  return { data, loading, error };
} 