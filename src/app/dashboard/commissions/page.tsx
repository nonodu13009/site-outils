"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { AuthGuard } from '@/components/AuthGuard';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useCommercialProduitCommission, CommercialProduitCommission } from '@/hooks/useCommercialProduitCommission';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';
import styles from './commissions.module.css';

export default function CommissionsPage() {
  const { profile, loading: profileLoading } = useUserProfile();
  const { commissions, loading, error, addCommission, updateCommission, deleteCommission } = useCommercialProduitCommission();
  const [showModal, setShowModal] = useState(false);
  const [editingCommission, setEditingCommission] = useState<CommercialProduitCommission | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  // Vérifier si l'utilisateur est administrateur
  useEffect(() => {
    if (!profileLoading && profile && profile.role !== 'administrateur') {
      router.push('/dashboard');
    }
  }, [profile, profileLoading, router]);

  const handleAddCommission = () => {
    setEditingCommission(null);
    setShowModal(true);
  };

  const handleEditCommission = (commission: CommercialProduitCommission) => {
    setEditingCommission(commission);
    setShowModal(true);
  };

  const handleDeleteCommission = async (id: string) => {
    setActionLoading(true);
    try {
      await deleteCommission(id);
      setMessage({ type: 'success', text: 'Commission supprimée avec succès' });
      setDeleteConfirm(null);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
    } finally {
      setActionLoading(false);
    }
  };

  const formatValeur = (commission: CommercialProduitCommission) => {
    if (commission.type === 'fixe') {
      return `${commission.valeur}€`;
    } else {
      return `${commission.valeur}%`;
    }
  };

  const formatBoost = (commission: CommercialProduitCommission) => {
    if (!commission.boost) return '-';
    const boostValue = commission.boost.type === 'fixe' ? `${commission.boost.valeur}€` : `${commission.boost.valeur}%`;
    const debut = new Date(commission.boost.periode.debut).toLocaleDateString('fr-FR');
    const fin = new Date(commission.boost.periode.fin).toLocaleDateString('fr-FR');
    return `${boostValue} (${debut} - ${fin})`;
  };

  const formatDuree = (commission: CommercialProduitCommission) => {
    if (!commission.duree) return '-';
    const debut = new Date(commission.duree.debut).toLocaleDateString('fr-FR');
    const fin = new Date(commission.duree.fin).toLocaleDateString('fr-FR');
    return `${debut} - ${fin}`;
  };

  if (profileLoading) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Chargement du profil...</p>
          </div>
        </DashboardLayout>
      </AuthGuard>
    );
  }

  if (!profile || profile.role !== 'administrateur') {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className={styles.accessDenied}>
            <h2>Accès refusé</h2>
            <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
          </div>
        </DashboardLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className={styles.container}>
          {/* Header */}
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Gestion des Commissions</h1>
              <p className={styles.subtitle}>
                Configurez les commissions par produit pour vos commerciaux
              </p>
            </div>
            <button
              onClick={handleAddCommission}
              className={styles.addButton}
              disabled={actionLoading}
            >
              <FontAwesomeIcon icon={faPlus} />
              Nouvelle Commission
            </button>
          </div>

          {/* Message de feedback */}
          {message && (
            <div className={`${styles.message} ${styles[message.type]}`}>
              {message.text}
            </div>
          )}

          {/* Table */}
          <div className={styles.tableWrapper}>
            {loading ? (
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Chargement des commissions...</p>
              </div>
            ) : error ? (
              <div className={styles.error}>
                <p>{error}</p>
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Type</th>
                    <th>Valeur</th>
                    <th>Boost</th>
                    <th>Période Boost</th>
                    <th>Durée</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className={styles.emptyState}>
                        <p>Aucune commission configurée</p>
                        <p className={styles.emptySubtext}>
                          Commencez par ajouter une nouvelle commission
                        </p>
                      </td>
                    </tr>
                  ) : (
                    commissions.map((commission) => (
                      <tr key={commission.id}>
                        <td>{commission.label}</td>
                        <td>
                          <span className={`${styles.badge} ${styles[commission.type]}`}>
                            {commission.type === 'fixe' ? 'Fixe' : 'Variable'}
                          </span>
                        </td>
                        <td>{formatValeur(commission)}</td>
                        <td>{formatBoost(commission)}</td>
                        <td>{commission.boost ? formatDuree(commission) : '-'}</td>
                        <td>{formatDuree(commission)}</td>
                        <td>
                          <span className={`${styles.badge} ${commission.actif ? styles.active : styles.inactive}`}>
                            {commission.actif ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actions}>
                            <button
                              onClick={() => handleEditCommission(commission)}
                              className={styles.actionButton}
                              title="Modifier"
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(commission.id)}
                              className={`${styles.actionButton} ${styles.delete}`}
                              title="Supprimer"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Modal de confirmation de suppression */}
          {deleteConfirm && (
            <div className={styles.modalOverlay}>
              <div className={styles.confirmModal}>
                <h3>Confirmer la suppression</h3>
                <p>Êtes-vous sûr de vouloir supprimer cette commission ?</p>
                <div className={styles.confirmActions}>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className={styles.cancelButton}
                    disabled={actionLoading}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => handleDeleteCommission(deleteConfirm)}
                    className={styles.deleteButton}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Suppression...' : 'Supprimer'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
} 