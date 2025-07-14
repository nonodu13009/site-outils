'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useRouter } from 'next/navigation';
import styles from './compagnies.module.css';
import Link from 'next/link';
import { DashboardLayout } from '@/components/DashboardLayout';

interface Company {
  id: string;
  nom: string;
  site: string;
  identifiant: string;
  password: string;
  lastUpdated: any;
  modifiedBy: string;
}

export default function CompagniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ nom: '', site: '', identifiant: '', password: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { profile, loading: profileLoading } = useUserProfile();
  const router = useRouter();

  // Vérifier si l'utilisateur est administrateur
  useEffect(() => {
    if (!profileLoading && profile && profile.role !== 'administrateur') {
      router.push('/dashboard');
    }
  }, [profile, profileLoading, router]);

  // Charger les compagnies
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'compagnies'));
        const companiesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Company[];
        setCompanies(companiesData);
      } catch (error) {
        console.error('Erreur lors du chargement des compagnies:', error);
        setMessage({ type: 'error', text: 'Erreur lors du chargement des compagnies' });
      } finally {
        setLoading(false);
      }
    };

    if (!profileLoading && profile?.role === 'administrateur') {
      loadCompanies();
    }
  }, [profile, profileLoading]);

  // Ajouter une compagnie
  const handleAddCompany = async () => {
    if (!formData.nom) {
      setMessage({ type: 'error', text: 'Le nom de la compagnie est obligatoire.' });
      return;
    }

    setActionLoading(true);
    try {
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash(formData.password, 10);
      
      await addDoc(collection(db, 'compagnies'), {
        nom: formData.nom,
        site: formData.site,
        identifiant: formData.identifiant,
        password: hashedPassword,
        lastUpdated: serverTimestamp(),
        modifiedBy: profile?.prenom + ' ' + profile?.nom
      });

      setMessage({ type: 'success', text: 'Compagnie ajoutée avec succès' });
      setShowAddForm(false);
      setFormData({ nom: '', site: '', identifiant: '', password: '' });
      
      // Recharger la liste
      const querySnapshot = await getDocs(collection(db, 'compagnies'));
      const companiesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Company[];
      setCompanies(companiesData);
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      setMessage({ type: 'error', text: 'Erreur lors de l\'ajout de la compagnie' });
    } finally {
      setActionLoading(false);
    }
  };

  // Modifier une compagnie
  const handleUpdateCompany = async (companyId: string, newData: Partial<Company>) => {
    setActionLoading(true);
    try {
      await updateDoc(doc(db, 'compagnies', companyId), {
        ...newData,
        lastUpdated: serverTimestamp(),
        modifiedBy: profile?.prenom + ' ' + profile?.nom
      });

      setMessage({ type: 'success', text: 'Compagnie modifiée avec succès' });
      setEditingId(null);
      
      // Recharger la liste
      const querySnapshot = await getDocs(collection(db, 'compagnies'));
      const companiesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Company[];
      setCompanies(companiesData);
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la modification' });
    } finally {
      setActionLoading(false);
    }
  };

  // Supprimer une compagnie
  const handleDeleteCompany = async (companyId: string) => {
    setActionLoading(true);
    try {
      await deleteDoc(doc(db, 'compagnies', companyId));
      
      setMessage({ type: 'success', text: 'Compagnie supprimée avec succès' });
      setDeleteConfirm(null);
      
      // Recharger la liste
      const querySnapshot = await getDocs(collection(db, 'compagnies'));
      const companiesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Company[];
      setCompanies(companiesData);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
    } finally {
      setActionLoading(false);
    }
  };

  // Basculer l'affichage du mot de passe
  const togglePassword = (companyId: string) => {
    setShowPassword(prev => ({
      ...prev,
      [companyId]: !prev[companyId]
    }));
  };

  // Formater la date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('fr-FR');
  };

  if (profileLoading) {
    return (
      <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Chargement du profil...</p>
        </div>
      </div>
      </DashboardLayout>
    );
  }

  if (!profile || profile.role !== 'administrateur') {
    return (
      <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.accessDenied}>
          <h2>Accès refusé</h2>
          <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        </div>
      </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Chargement des compagnies...</p>
        </div>
      </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Gestion des Compagnies</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {/* Suppression du bouton Dashboard */}
          <button 
            className={styles.addButton}
            onClick={() => setShowAddForm(true)}
            disabled={actionLoading}
          >
            <i className="fas fa-plus"></i>
            Ajouter une compagnie
          </button>
        </div>
      </div>

      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
          <button onClick={() => setMessage(null)} className={styles.closeMessage}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {showAddForm && (
        <div className={styles.addForm}>
          <h3>Ajouter une nouvelle compagnie</h3>
          <div className={styles.formGroup}>
            <label htmlFor="nom">Nom de la compagnie</label>
            <input
              type="text"
              id="nom"
              value={formData.nom}
              onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
              placeholder="Nom de la compagnie"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="site">Site internet</label>
            <input
                type="text"
              id="site"
              value={formData.site}
              onChange={(e) => setFormData(prev => ({ ...prev, site: e.target.value }))}
                placeholder="Site internet"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="identifiant">Identifiant</label>
            <input
              type="text"
              id="identifiant"
              value={formData.identifiant}
              onChange={(e) => setFormData(prev => ({ ...prev, identifiant: e.target.value }))}
              placeholder="Identifiant de la compagnie"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Mot de passe"
            />
          </div>
          <div className={styles.formActions}>
            <button 
              onClick={handleAddCompany}
              disabled={actionLoading}
              className={styles.saveButton}
            >
              {actionLoading ? 'Ajout...' : 'Ajouter'}
            </button>
            <button 
              onClick={() => {
                setShowAddForm(false);
                setFormData({ nom: '', site: '', identifiant: '', password: '' });
              }}
              className={styles.cancelButton}
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Site internet</th>
              <th>Identifiant</th>
              <th>Mot de passe</th>
              <th>Dernière mise à jour</th>
              <th>Modifié par</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company.id}>
                <td>
                  {editingId === company.id ? (
                    <input
                      type="text"
                      value={company.nom}
                      onChange={(e) => {
                        const updatedCompanies = companies.map(c => 
                          c.id === company.id ? { ...c, nom: e.target.value } : c
                        );
                        setCompanies(updatedCompanies);
                      }}
                      className={styles.editInput}
                    />
                  ) : (
                    company.nom
                  )}
                </td>
                <td>
                  {editingId === company.id ? (
                    <input
                        type="text"
                      value={company.site}
                      onChange={(e) => {
                        const updatedCompanies = companies.map(c => 
                          c.id === company.id ? { ...c, site: e.target.value } : c
                        );
                        setCompanies(updatedCompanies);
                      }}
                      className={styles.editInput}
                    />
                  ) : (
                    <a href={company.site} target="_blank" rel="noopener noreferrer" className={styles.siteLink}>{company.site}</a>
                  )}
                </td>
                <td>
                  {editingId === company.id ? (
                    <input
                      type="text"
                      value={company.identifiant}
                      onChange={(e) => {
                        const updatedCompanies = companies.map(c => 
                          c.id === company.id ? { ...c, identifiant: e.target.value } : c
                        );
                        setCompanies(updatedCompanies);
                      }}
                      className={styles.editInput}
                    />
                  ) : (
                    company.identifiant
                  )}
                </td>
                <td>
                  <div className={styles.passwordCell}>
                    <span className={styles.passwordText}>
                      {showPassword[company.id] ? '••••••••' : '••••••••'}
                    </span>
                    <button
                      onClick={() => togglePassword(company.id)}
                      className={styles.passwordToggle}
                      title={showPassword[company.id] ? 'Masquer' : 'Afficher'}
                    >
                      <i className={`fas fa-${showPassword[company.id] ? 'eye-slash' : 'eye'}`}></i>
                    </button>
                  </div>
                </td>
                <td>{formatDate(company.lastUpdated)}</td>
                <td>{company.modifiedBy}</td>
                <td>
                  <div className={styles.actions}>
                    {editingId === company.id ? (
                      <>
                        <button
                          onClick={() => handleUpdateCompany(company.id, {
                            nom: company.nom,
                            site: company.site,
                            identifiant: company.identifiant
                          })}
                          disabled={actionLoading}
                          className={styles.saveButton}
                          title="Sauvegarder"
                        >
                          <i className="fas fa-check"></i>
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className={styles.cancelButton}
                          title="Annuler"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingId(company.id)}
                          className={styles.editButton}
                          title="Modifier"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(company.id)}
                          className={styles.deleteButton}
                          title="Supprimer"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deleteConfirm && (
        <div className={styles.confirmDialog}>
          <div className={styles.confirmContent}>
            <h3>Confirmer la suppression</h3>
            <p>Êtes-vous sûr de vouloir supprimer cette compagnie ?</p>
            <div className={styles.confirmActions}>
              <button
                onClick={() => handleDeleteCompany(deleteConfirm)}
                disabled={actionLoading}
                className={styles.deleteButton}
              >
                {actionLoading ? 'Suppression...' : 'Supprimer'}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className={styles.cancelButton}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </DashboardLayout>
  );
} 