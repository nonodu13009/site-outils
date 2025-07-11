import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { db } from './firebase';

// Types génériques pour Firestore
export interface FirestoreDocument {
  id: string;
  [key: string]: unknown;
}

// Obtenir un document par ID
export const getDocument = async <T>(
  collectionName: string, 
  documentId: string
): Promise<T | null> => {
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération du document:', error);
    throw error;
  }
};

// Obtenir tous les documents d'une collection
export const getDocuments = async <T>(
  collectionName: string
): Promise<T[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as T[];
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    throw error;
  }
};

// Ajouter un nouveau document
export const addDocument = async <T>(
  collectionName: string, 
  data: Omit<T, 'id'>
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    return docRef.id;
  } catch (error) {
    console.error('Erreur lors de l\'ajout du document:', error);
    throw error;
  }
};

// Mettre à jour un document
export const updateDocument = async <T>(
  collectionName: string, 
  documentId: string, 
  data: Partial<T>
): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, documentId);
    await updateDoc(docRef, data);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du document:', error);
    throw error;
  }
};

// Supprimer un document
export const deleteDocument = async (
  collectionName: string, 
  documentId: string
): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, documentId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Erreur lors de la suppression du document:', error);
    throw error;
  }
};

// Obtenir des documents avec des filtres
export const getDocumentsWithQuery = async <T>(
  collectionName: string,
  field: string,
  operator: '==' | '!=' | '<' | '<=' | '>' | '>=',
  value: unknown
): Promise<T[]> => {
  try {
    const q = query(
      collection(db, collectionName),
      where(field, operator, value)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as T[];
  } catch (error) {
    console.error('Erreur lors de la requête des documents:', error);
    throw error;
  }
}; 