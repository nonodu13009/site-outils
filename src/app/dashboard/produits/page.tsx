"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AuthGuard } from "@/components/AuthGuard";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useCommercialProduitCommission } from "@/hooks/useCommercialProduitCommission";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCheckCircle, faTimesCircle, faCheck, faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { PremiumModal } from "@/components/PremiumModal";
import { ToggleSwitch } from '@/components/ToggleSwitch';

export default function ProduitsPage() {
  const { profile, loading: profileLoading } = useUserProfile();
  const { commissions, loading, error, addCommission, updateCommission, deleteCommission } = useCommercialProduitCommission();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    nom: '',
    description: '',
    type_commission: '',
    commission: {},
    date_debut: null,
    date_fin: null,
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<any>(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'date_debut' || name === 'date_fin') {
      setForm((prev) => ({ ...prev, [name]: value }));
      return;
    }
    if (name.startsWith('commission.')) {
      setForm((prev) => ({
        ...prev,
        commission: {
          ...prev.commission,
          [name.replace('commission.', '')]: value
        }
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError(null);
    try {
      // Construction du document à partir du form
      const doc = {
        nom: form.nom,
        description: form.description,
        type_commission: form.type_commission,
        commission: { ...form.commission },
        actif: true,
        date_debut: form.date_debut || null,
        date_fin: form.date_fin || null,
        date_creation: new Date(),
        date_modification: new Date(),
      };
      await addCommission(doc);
      setModalOpen(false);
      setForm({ nom: '', description: '', type_commission: '', commission: {}, date_debut: null, date_fin: null });
      setSuccessMessage(`Produit "${form.nom}" ajouté avec succès !`);
      // Auto-hide du message de succès après 4 secondes
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setSubmitError('Erreur lors de l\'enregistrement. Veuillez réessayer.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleToggleActif = async (id: string, checked: boolean) => {
    try {
      await updateCommission(id, { actif: checked });
      setSuccessMessage(checked ? 'Produit activé !' : 'Produit désactivé.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (e) {
      setSubmitError("Erreur lors du changement d'état.");
    }
  };

  const handleEdit = (prod) => {
    setEditForm({ ...prod });
    setEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === 'date_debut' || name === 'date_fin') {
      setEditForm((prev) => ({ ...prev, [name]: value }));
      return;
    }
    if (name.startsWith('commission.')) {
      setEditForm((prev) => ({
        ...prev,
        commission: {
          ...prev.commission,
          [name.replace('commission.', '')]: value
        }
      }));
    } else {
      setEditForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setSubmitError(null);
    try {
      const updates = {
        nom: editForm.nom,
        description: editForm.description,
        type_commission: editForm.type_commission,
        commission: { ...editForm.commission },
        actif: editForm.actif,
        date_debut: editForm.date_debut || null,
        date_fin: editForm.date_fin || null,
      };
      await updateCommission(editForm.id, updates);
      setEditModalOpen(false);
      setSuccessMessage('Produit modifié avec succès !');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setSubmitError("Erreur lors de la modification.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = (prod) => {
    setToDelete(prod);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setEditLoading(true);
    setSubmitError(null);
    try {
      await deleteCommission(toDelete.id);
      setDeleteModalOpen(false);
      setSuccessMessage('Produit supprimé !');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setSubmitError("Erreur lors de la suppression.");
    } finally {
      setEditLoading(false);
      setToDelete(null);
    }
  };

  useEffect(() => {
    if (!profileLoading && profile && profile.role !== "administrateur") {
      router.push("/dashboard");
    }
  }, [profile, profileLoading, router]);

  if (profileLoading) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200, color: "#86868b", fontSize: "1.1rem" }}>
            Chargement du profil...
          </div>
        </DashboardLayout>
      </AuthGuard>
    );
  }

  if (!profile || profile.role !== "administrateur") {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div style={{ padding: "2rem", textAlign: "center", color: "#86868b" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: 600, color: "#1d1d1f", marginBottom: "1rem" }}>Accès refusé</h2>
            <p style={{ fontSize: "1.1rem" }}>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
          </div>
        </DashboardLayout>
      </AuthGuard>
    );
  }

  function getActifStatus(prod) {
    const now = new Date();
    const debut = prod.date_debut ? new Date(prod.date_debut) : null;
    const fin = prod.date_fin ? new Date(prod.date_fin) : null;
    if (debut && now < debut) return { actif: false, motif: 'à venir' };
    if (fin && now > fin) return { actif: false, motif: 'expiré' };
    if (debut && now >= debut && (!fin || now <= fin)) return { actif: true, motif: 'actif auto' };
    if (!debut && !fin) return { actif: prod.actif, motif: 'manuel' };
    if (!debut && fin && now <= fin) return { actif: true, motif: 'actif auto' };
    return { actif: prod.actif, motif: 'manuel' };
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "2.5rem 1.5rem 0 1.5rem" }}>
          {/* Notification de succès */}
          {successMessage && (
            <div style={{
              position: 'fixed',
              top: '2rem',
              right: '2rem',
              background: '#34c759',
              color: '#fff',
              padding: '1rem 1.5rem',
              borderRadius: 12,
              boxShadow: '0 4px 20px rgba(52,199,89,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.8rem',
              fontSize: '1rem',
              fontWeight: 600,
              zIndex: 1000,
              animation: 'slideInRight 0.3s ease-out'
            }}>
              <FontAwesomeIcon icon={faCheck} style={{ fontSize: '1.1em' }} />
              {successMessage}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "flex-end", gap: "2.5rem", marginBottom: "1.2rem", marginTop: 0 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontSize: "2.5rem", fontWeight: 700, color: "#1d1d1f", margin: 0, letterSpacing: "-0.02em", lineHeight: 1.1 }}>Gestion des produits & commissions</h1>
              <p style={{ fontSize: "1.1rem", color: "#86868b", margin: 0, fontWeight: 400 }}>Administrez dynamiquement les produits et barèmes de commission</p>
            </div>
            <button
              style={{ background: "#007aff", color: "#fff", border: "none", borderRadius: 12, padding: "1rem 2rem", fontSize: "1.1rem", fontWeight: 600, boxShadow: "0 2px 12px rgba(0,122,255,0.10)", cursor: "pointer", display: "flex", alignItems: "center", gap: ".7rem", transition: "background 0.18s, box-shadow 0.18s", marginLeft: "auto" }}
              onClick={() => setModalOpen(true)}
            >
              <FontAwesomeIcon icon={faPlus} style={{ fontSize: "1.2em" }} />
              Nouveau produit
            </button>
          </div>
          <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1px solid #e5e5ea", overflow: "hidden", marginTop: 0 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".98rem" }}>
              <thead>
                <tr style={{ background: "#f5f5f7" }}>
                  <th style={{ padding: "1.2rem 1rem", textAlign: "left", fontWeight: 600, color: "#1d1d1f", fontSize: ".93rem", letterSpacing: "-0.01em" }}>Produit</th>
                  <th style={{ padding: "1.2rem 1rem" }}>Type</th>
                  <th style={{ padding: "1.2rem 1rem" }}>Commission</th>
                  <th style={{ padding: "1.2rem 1rem" }}>Actif</th>
                  <th style={{ padding: "1.2rem 1rem" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} style={{ textAlign: "center", padding: "3rem", color: "#86868b" }}>Chargement...</td></tr>
                ) : error ? (
                  <tr><td colSpan={4} style={{ textAlign: "center", padding: "3rem", color: "#dc3545" }}>{error}</td></tr>
                ) : commissions.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: "center", padding: "3rem", color: "#86868b" }}>Aucun produit configuré</td></tr>
                ) : (
                  commissions.map((prod) => {
                    const status = getActifStatus(prod);
                    return (
                      <tr key={prod.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                        <td style={{ padding: "1.1rem 1rem", fontWeight: 500, color: "#1d1d1f" }}>{prod.nom}</td>
                        <td style={{ padding: "1.1rem 1rem", color: "#86868b" }}>{prod.type_commission}</td>
                        <td style={{ padding: "1.1rem 1rem" }}>
                          {prod.type_commission === 'fixe' ? `${prod.commission?.montant} €` : 
                           prod.type_commission === 'variable' ? `${prod.commission?.pourcentage} %` : 
                           prod.type_commission === 'progressive' ? `${prod.commission?.base} € + ${prod.commission?.tranche_supplementaire} € / ${prod.commission?.seuil_tranche} €` : '-'}
                        </td>
                        <td style={{ padding: "1.1rem 1rem" }}>
                          <ToggleSwitch
                            checked={status.actif}
                            onChange={checked => handleToggleActif(prod.id, checked)}
                            label={status.actif ? 'Actif' : 'Inactif'}
                            id={`toggle-${prod.id}`}
                            disabled={status.motif !== 'manuel'}
                          />
                          {status.motif !== 'manuel' && (
                            <span style={{ fontSize: '0.85rem', color: '#86868b', marginLeft: 8 }}>
                              {status.motif === 'à venir' && 'Activation à venir'}
                              {status.motif === 'expiré' && 'Expiré'}
                              {status.motif === 'actif auto' && 'Actif automatiquement'}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "1.1rem 1rem", display: 'flex', gap: '1.1rem', alignItems: 'center' }}>
                          <button
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#007aff', fontSize: '1.1em', padding: 6, borderRadius: 8, transition: 'background 0.15s' }}
                            aria-label="Éditer"
                            onClick={() => handleEdit(prod)}
                          >
                            <FontAwesomeIcon icon={faPen} />
                          </button>
                          <button
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc3545', fontSize: '1.1em', padding: 6, borderRadius: 8, transition: 'background 0.15s' }}
                            aria-label="Supprimer"
                            onClick={() => handleDelete(prod)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        <PremiumModal open={modalOpen} onClose={() => setModalOpen(false)} title="Nouveau produit / commission">
          <form style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }} onSubmit={handleSubmit}>
            <div>
              <label style={{ fontWeight: 600, color: '#1d1d1f', fontSize: '1.05rem', marginBottom: 4, display: 'block' }}>Nom du produit</label>
              <input type="text" name="nom" value={form.nom} onChange={handleChange} placeholder="Ex : Auto, IRD Pro..." style={{ width: '100%', padding: '0.85rem 1.1rem', border: '1.5px solid #e5e5ea', borderRadius: 12, fontSize: '1.05rem', color: '#1d1d1f', background: '#fafbfc', marginBottom: 0 }} required />
            </div>
            <div>
              <label style={{ fontWeight: 600, color: '#1d1d1f', fontSize: '1.05rem', marginBottom: 4, display: 'block' }}>Description</label>
              <input type="text" name="description" value={form.description} onChange={handleChange} placeholder="Description du produit" style={{ width: '100%', padding: '0.85rem 1.1rem', border: '1.5px solid #e5e5ea', borderRadius: 12, fontSize: '1.05rem', color: '#1d1d1f', background: '#fafbfc', marginBottom: 0 }} required />
            </div>
            <div>
              <label style={{ fontWeight: 600, color: '#1d1d1f', fontSize: '1.05rem', marginBottom: 4, display: 'block' }}>Type de commission</label>
              <select name="type_commission" value={form.type_commission} onChange={handleChange} style={{ width: '100%', padding: '0.85rem 1.1rem', border: '1.5px solid #e5e5ea', borderRadius: 12, fontSize: '1.05rem', color: '#1d1d1f', background: '#fafbfc', marginBottom: 0 }} required>
                <option value="">Sélectionner un type</option>
                <option value="fixe">Fixe</option>
                <option value="variable">Variable</option>
                <option value="progressive">Progressive</option>
              </select>
            </div>
            {/* Champs dynamiques selon le type */}
            {form.type_commission === 'fixe' && (
              <div>
                <label style={{ fontWeight: 600, color: '#1d1d1f', fontSize: '1.05rem', marginBottom: 4, display: 'block' }}>Montant (€)</label>
                <input type="number" name="commission.montant" value={form.commission.montant || ''} onChange={handleChange} min={0} placeholder="Ex : 10" style={{ width: '100%', padding: '0.85rem 1.1rem', border: '1.5px solid #e5e5ea', borderRadius: 12, fontSize: '1.05rem', color: '#1d1d1f', background: '#fafbfc', marginBottom: 0 }} required />
              </div>
            )}
            {form.type_commission === 'variable' && (
              <div>
                <label style={{ fontWeight: 600, color: '#1d1d1f', fontSize: '1.05rem', marginBottom: 4, display: 'block' }}>Pourcentage (%)</label>
                <input type="number" name="commission.pourcentage" value={form.commission.pourcentage || ''} onChange={handleChange} min={0} max={100} step={0.01} placeholder="Ex : 1" style={{ width: '100%', padding: '0.85rem 1.1rem', border: '1.5px solid #e5e5ea', borderRadius: 12, fontSize: '1.05rem', color: '#1d1d1f', background: '#fafbfc', marginBottom: 0 }} required />
              </div>
            )}
            {form.type_commission === 'progressive' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                <div>
                  <label style={{ fontWeight: 600, color: '#1d1d1f', fontSize: '1.05rem', marginBottom: 4, display: 'block' }}>Base (€)</label>
                  <input type="number" name="commission.base" value={form.commission.base || ''} onChange={handleChange} min={0} placeholder="Ex : 20" style={{ width: '100%', padding: '0.85rem 1.1rem', border: '1.5px solid #e5e5ea', borderRadius: 12, fontSize: '1.05rem', color: '#1d1d1f', background: '#fafbfc', marginBottom: 0 }} required />
                </div>
                <div>
                  <label style={{ fontWeight: 600, color: '#1d1d1f', fontSize: '1.05rem', marginBottom: 4, display: 'block' }}>Supplément/tranche (€)</label>
                  <input type="number" name="commission.tranche_supplementaire" value={form.commission.tranche_supplementaire || ''} onChange={handleChange} min={0} placeholder="Ex : 10" style={{ width: '100%', padding: '0.85rem 1.1rem', border: '1.5px solid #e5e5ea', borderRadius: 12, fontSize: '1.05rem', color: '#1d1d1f', background: '#fafbfc', marginBottom: 0 }} required />
                </div>
                <div>
                  <label style={{ fontWeight: 600, color: '#1d1d1f', fontSize: '1.05rem', marginBottom: 4, display: 'block' }}>Seuil tranche (€)</label>
                  <input type="number" name="commission.seuil_tranche" value={form.commission.seuil_tranche || ''} onChange={handleChange} min={0} placeholder="Ex : 1000" style={{ width: '100%', padding: '0.85rem 1.1rem', border: '1.5px solid #e5e5ea', borderRadius: 12, fontSize: '1.05rem', color: '#1d1d1f', background: '#fafbfc', marginBottom: 0 }} required />
                </div>
                <div>
                  <label style={{ fontWeight: 600, color: '#1d1d1f', fontSize: '1.05rem', marginBottom: 4, display: 'block' }}>Seuil début (€)</label>
                  <input type="number" name="commission.seuil_debut" value={form.commission.seuil_debut || ''} onChange={handleChange} min={0} placeholder="Ex : 999" style={{ width: '100%', padding: '0.85rem 1.1rem', border: '1.5px solid #e5e5ea', borderRadius: 12, fontSize: '1.05rem', color: '#1d1d1f', background: '#fafbfc', marginBottom: 0 }} required />
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: '1.2rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 600, color: '#1d1d1f', fontSize: '1.05rem', marginBottom: 4, display: 'block' }}>Date de début</label>
                <input type="date" name="date_debut" value={form.date_debut || ''} onChange={handleChange} style={{ width: '100%', padding: '0.7rem 1rem', border: '1.5px solid #e5e5ea', borderRadius: 12, fontSize: '1.05rem', color: '#1d1d1f', background: '#fafbfc' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 600, color: '#1d1d1f', fontSize: '1.05rem', marginBottom: 4, display: 'block' }}>Date de fin</label>
                <input type="date" name="date_fin" value={form.date_fin || ''} onChange={handleChange} style={{ width: '100%', padding: '0.7rem 1rem', border: '1.5px solid #e5e5ea', borderRadius: 12, fontSize: '1.05rem', color: '#1d1d1f', background: '#fafbfc' }} />
              </div>
            </div>
            {submitError && <div style={{ color: '#dc3545', fontWeight: 500, marginBottom: 8 }}>{submitError}</div>}
            <div style={{ display: 'flex', gap: '1.2rem', justifyContent: 'flex-end', marginTop: '1.2rem' }}>
              <button type="button" style={{ background: '#f5f5f7', color: '#86868b', border: 'none', borderRadius: 999, padding: '0.7rem 1.7rem', fontSize: '1.05rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.18s, color 0.18s' }} onClick={() => setModalOpen(false)} disabled={submitLoading}>Annuler</button>
              <button type="submit" style={{ background: '#007aff', color: '#fff', border: 'none', borderRadius: 999, padding: '0.7rem 1.7rem', fontSize: '1.05rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.18s, box-shadow 0.18s', boxShadow: '0 2px 8px rgba(0,122,255,0.08)' }} disabled={submitLoading}>{submitLoading ? 'Enregistrement...' : 'Valider'}</button>
            </div>
          </form>
        </PremiumModal>

        <PremiumModal open={editModalOpen} onClose={() => setEditModalOpen(false)} title="Modifier le produit / commission">
          {editForm && (
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }} onSubmit={handleEditSubmit}>
              <div>
                <label style={{ fontWeight: 600, color: '#1d1d1f', fontSize: '1.05rem', marginBottom: 4, display: 'block' }}>Nom du produit</label>
                <input type="text" name="nom" value={editForm.nom} onChange={handleEditChange} placeholder="Ex : Auto, IRD Pro..." style={{ width: '100%', padding: '0.85rem 1.1rem', border: '1.5px solid #e5e5ea', borderRadius: 12, fontSize: '1.05rem', color: '#1d1d1f', background: '#fafbfc', marginBottom: 0 }} required />
              </div>
              <div>
                <label style={{ fontWeight: 600, color: '#1d1d1f', fontSize: '1.05rem', marginBottom: 4, display: 'block' }}>Description</label>
                <input type="text" name="description" value={editForm.description} onChange={handleEditChange} placeholder="Description du produit" style={{ width: '100%', padding: '0.85rem 1.1rem', border: '1.5px solid #e5e5ea', borderRadius: 12, fontSize: '1.05rem', color: '#1d1d1f', background: '#fafbfc', marginBottom: 0 }} required />
              </div>
              <div>
                <label style={{ fontWeight: 600, color: '#1d1d1f', fontSize: '1.05rem', marginBottom: 4, display: 'block' }}>Type de commission</label>
                <select name="type_commission" value={editForm.type_commission} onChange={handleEditChange} style={{ width: '100%', padding: '0.85rem 1.1rem', border: '1.5px solid #e5e5ea', borderRadius: 12, fontSize: '1.05rem', color: '#1d1d1f', background: '#fafbfc', marginBottom: 0 }} required>
                  <option value="">Sélectionner un type</option>
                  <option value="fixe">Fixe</option>
                  <option value="variable">Variable</option>
                  <option value="progressive">Progressive</option>
                </select>
              </div>
              {/* Champs dynamiques selon le type */}
              {editForm.type_commission === 'fixe' && (
                <div>
                  <label style={{ fontWeight: 600, color: '#1d1d1f', fontSize: '1.05rem', marginBottom: 4, display: 'block' }}>Montant (€)</label>
                  <input type="number" name="commission.montant" value={editForm.commission.montant || ''} onChange={handleEditChange} min={0} placeholder="Ex : 10" style={{ width: '100%', padding: '0.85rem 1.1rem', border: '1.5px solid #e5e5ea', borderRadius: 12, fontSize: '1.05rem', color: '#1d1d1f', background: '#fafbfc', marginBottom: 0 }} required />
                </div>
              )}
              {editForm.type_commission === 'variable' && (
                <div>
                  <label style={{ fontWeight: 600, color: '#1d1d1f', fontSize: '1.05rem', marginBottom: 4, display: 'block' }}>Pourcentage (%)</label>
                  <input type="number" name="commission.pourcentage" value={editForm.commission.pourcentage || ''} onChange={handleEditChange} min={0} max={100} step={0.01} placeholder="Ex : 1" style={{ width: '100%', padding: '0.85rem 1.1rem', border: '1.5px solid #e5e5ea', borderRadius: 12, fontSize: '1.05rem', color: '#1d1d1f', background: '#fafbfc', marginBottom: 0 }} required />
                </div>
              )}
              {editForm.type_commission === 'progressive' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                  <div>
                    <label style={{ fontWeight: 600, color: '#1d1d1f', fontSize: '1.05rem', marginBottom: 4, display: 'block' }}>Base (€)</label>
                    <input type="number" name="commission.base" value={editForm.commission.base || ''} onChange={handleEditChange} min={0} placeholder="Ex : 20" style={{ width: '100%', padding: '0.85rem 1.1rem', border: '1.5px solid #e5e5ea', borderRadius: 12, fontSize: '1.05rem', color: '#1d1d1f', background: '#fafbfc', marginBottom: 0 }} required />
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, color: '#1d1d1f', fontSize: '1.05rem', marginBottom: 4, display: 'block' }}>Supplément/tranche (€)</label>
                    <input type="number" name="commission.tranche_supplementaire" value={editForm.commission.tranche_supplementaire || ''} onChange={handleEditChange} min={0} placeholder="Ex : 10" style={{ width: '100%', padding: '0.85rem 1.1rem', border: '1.5px solid #e5e5ea', borderRadius: 12, fontSize: '1.05rem', color: '#1d1d1f', background: '#fafbfc', marginBottom: 0 }} required />
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, color: '#1d1d1f', fontSize: '1.05rem', marginBottom: 4, display: 'block' }}>Seuil tranche (€)</label>
                    <input type="number" name="commission.seuil_tranche" value={editForm.commission.seuil_tranche || ''} onChange={handleEditChange} min={0} placeholder="Ex : 1000" style={{ width: '100%', padding: '0.85rem 1.1rem', border: '1.5px solid #e5e5ea', borderRadius: 12, fontSize: '1.05rem', color: '#1d1d1f', background: '#fafbfc', marginBottom: 0 }} required />
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, color: '#1d1d1f', fontSize: '1.05rem', marginBottom: 4, display: 'block' }}>Seuil début (€)</label>
                    <input type="number" name="commission.seuil_debut" value={editForm.commission.seuil_debut || ''} onChange={handleEditChange} min={0} placeholder="Ex : 999" style={{ width: '100%', padding: '0.85rem 1.1rem', border: '1.5px solid #e5e5ea', borderRadius: 12, fontSize: '1.05rem', color: '#1d1d1f', background: '#fafbfc', marginBottom: 0 }} required />
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: '1.2rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 600, color: '#1d1d1f', fontSize: '1.05rem', marginBottom: 4, display: 'block' }}>Date de début</label>
                  <input type="date" name="date_debut" value={editForm.date_debut || ''} onChange={handleEditChange} style={{ width: '100%', padding: '0.7rem 1rem', border: '1.5px solid #e5e5ea', borderRadius: 12, fontSize: '1.05rem', color: '#1d1d1f', background: '#fafbfc' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 600, color: '#1d1d1f', fontSize: '1.05rem', marginBottom: 4, display: 'block' }}>Date de fin</label>
                  <input type="date" name="date_fin" value={editForm.date_fin || ''} onChange={handleEditChange} style={{ width: '100%', padding: '0.7rem 1rem', border: '1.5px solid #e5e5ea', borderRadius: 12, fontSize: '1.05rem', color: '#1d1d1f', background: '#fafbfc' }} />
                </div>
              </div>
              {submitError && <div style={{ color: '#dc3545', fontWeight: 500, marginBottom: 8 }}>{submitError}</div>}
              <div style={{ display: 'flex', gap: '1.2rem', justifyContent: 'flex-end', marginTop: '1.2rem' }}>
                <button type="button" style={{ background: '#f5f5f7', color: '#86868b', border: 'none', borderRadius: 999, padding: '0.7rem 1.7rem', fontSize: '1.05rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.18s, color 0.18s' }} onClick={() => setEditModalOpen(false)} disabled={editLoading}>Annuler</button>
                <button type="submit" style={{ background: '#007aff', color: '#fff', border: 'none', borderRadius: 999, padding: '0.7rem 1.7rem', fontSize: '1.05rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.18s, box-shadow 0.18s', boxShadow: '0 2px 8px rgba(0,122,255,0.08)' }} disabled={editLoading}>{editLoading ? 'Enregistrement...' : 'Valider'}</button>
              </div>
            </form>
          )}
        </PremiumModal>

        <PremiumModal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Supprimer ce produit ?">
          <div style={{ padding: '1.2rem 0', fontSize: '1.08rem', color: '#1d1d1f' }}>
            Êtes-vous sûr de vouloir supprimer <b>{toDelete?.nom}</b> ? Cette action est irréversible.
          </div>
          {submitError && <div style={{ color: '#dc3545', fontWeight: 500, marginBottom: 8 }}>{submitError}</div>}
          <div style={{ display: 'flex', gap: '1.2rem', justifyContent: 'flex-end', marginTop: '1.2rem' }}>
            <button type="button" style={{ background: '#f5f5f7', color: '#86868b', border: 'none', borderRadius: 999, padding: '0.7rem 1.7rem', fontSize: '1.05rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.18s, color 0.18s' }} onClick={() => setDeleteModalOpen(false)} disabled={editLoading}>Annuler</button>
            <button type="button" style={{ background: '#dc3545', color: '#fff', border: 'none', borderRadius: 999, padding: '0.7rem 1.7rem', fontSize: '1.05rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.18s, box-shadow 0.18s', boxShadow: '0 2px 8px rgba(220,53,69,0.08)' }} onClick={confirmDelete} disabled={editLoading}>{editLoading ? 'Suppression...' : 'Supprimer'}</button>
          </div>
        </PremiumModal>
      </DashboardLayout>
    </AuthGuard>
  );
} 