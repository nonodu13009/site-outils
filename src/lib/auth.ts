import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  UserCredential
} from 'firebase/auth';
import { auth } from './firebase';

// Types
export interface AuthError {
  code: string;
  message: string;
}

// Connexion avec email et mot de passe
export const signInWithEmail = async (
  email: string, 
  password: string
): Promise<UserCredential> => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw error as AuthError;
  }
};

// Création d'un compte avec email et mot de passe
export const signUpWithEmail = async (
  email: string, 
  password: string
): Promise<UserCredential> => {
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw error as AuthError;
  }
};

// Déconnexion
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error as AuthError;
  }
};

// Écouter les changements d'état d'authentification
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Obtenir l'utilisateur actuel
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
}; 