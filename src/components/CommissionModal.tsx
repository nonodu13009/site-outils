"use client";

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { CommercialProduitCommission } from '@/hooks/useCommercialProduitCommission';
import styles from './CommissionModal.module.css';

interface CommissionModalProps {
  open: boolean;
  onClose: () => void;
  commission?: CommercialProduitCommission | null;
  onSubmit: (data: Omit<CommercialProduitCommission, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  loading?: boolean;
}

const produitsOptions = [
  { value: 'auto', label: 'Auto' },
  { value: 'moto', label: 'Moto' },
  { value: 'nop50eur', label: 'NOP 50€' },
  { value: 'ird_part', label: 'IRD Part' },
  { value: 'ird_pro', label: 'IRD Pro' },
  { value: 'pj_part', label: 'PJ Part' },
  { value: 'pj_pro', label: 'PJ Pro' },
  { value: 'sante', label: 'Santé' },
  { value: 'prev', label: 'Prévoyance' },
  { value: 'vie_pp', label: 'Vie PP' },
  { value: 'vie_pu', label: 'Vie PU' },
];

export function CommissionModal({ open, onClose, commission, onSubmit, loading = false }: CommissionModalProps) {
  const [form, setForm] = useState({
    produit: '',
    label: '',
    type: 'fixe' as 'fixe' | 'variable',
    valeur: 0,
    boost: {
      type: 'fixe' as 'fixe' | 'variable',
      valeur: 0,
      periode: {
        debut: '',
        fin: '',
      },
    },
    duree: {
      debut: '',
      fin: '',
    },
    actif: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (commission) {
      setForm({
        produit: commission.produit,
        label: commission.label,
        type: commission.type,
        valeur: commission.valeur,
        boost: commission.boost ? {
          type: commission.boost.type,
          valeur: commission.boost.valeur,
          periode: {
            debut: commission.boost.periode.debut instanceof Date 
              ? commission.boost.periode.debut.toISOString().slice(0, 10)
              : commission.boost.periode.debut,
            fin: commission.boost.periode.fin instanceof Date 
              ? commission.boost.periode.fin.toISOString().slice(0, 10)
              : commission.boost.periode.fin,
          },
        } : {
          type: 'fixe',
          valeur: 0,
          periode: { debut: '', fin: '' },
        },
        duree: commission.duree ? {
          debut: commission.duree.debut instanceof Date 
            ? commission.duree.debut.toISOString().slice(0, 10)
            : commission.duree.debut,
          fin: commission.duree.fin instanceof Date 
            ? commission.duree.fin.toISOString().slice(0, 10)
            : commission.duree.fin,
        } : { debut: '', fin: '' },
        actif: commission.actif,
      });
    } else {
      setForm({
        produit: '',
        label: '',
        type: 'fixe',
        valeur: 0,
        boost: {
          type: 'fixe',
          valeur: 0,
          periode: { debut: '', fin: '' },
        },
        duree: { debut: '', fin: '' },
        actif: true,
      });
    }
    setErrors({});
  }, [commission, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'valeur' || name === 'actif' ? 
        (name === 'actif' ? (e.target as HTMLInputElement).checked : Number(value)) : 
        value,
    }));
  };

  const handleBoostChange = (field: string, value: string | number) => {
    setForm(prev => ({
      ...prev,
      boost: {
        ...prev.boost,
        [field]: field === 'valeur' ? Number(value) : value,
      },
    }));
  };

  const handleDureeChange = (field: string, value: string) => {
    setForm(prev => ({
      ...prev,
      duree: {
        ...prev.duree,
        [field]: value,
      },
    }));
  };

  const handleProduitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const produit = e.target.value;
    const selectedProduit = produitsOptions.find(p => p.value === produit);
    setForm(prev => ({
      ...prev,
      produit,
      label: selectedProduit?.label || '',
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.produit) newErrors.produit = 'Le produit est requis';
    if (!form.label) newErrors.label = 'Le label est requis';
    if (form.valeur <= 0) newErrors.valeur = 'La valeur doit être positive';
    if (form.type === 'variable' && form.valeur > 100) {
      newErrors.valeur = 'Le pourcentage ne peut pas dépasser 100%';
    }

    if (form.boost.periode.debut && form.boost.periode.fin) {
      const debut = new Date(form.boost.periode.debut);
      const fin = new Date(form.boost.periode.fin);
      if (debut >= fin) {
        newErrors.boostPeriode = 'La date de fin doit être après la date de début';
      }
    }

    if (form.duree.debut && form.duree.fin) {
      const debut = new Date(form.duree.debut);
      const fin = new Date(form.duree.fin);
      if (debut >= fin) {
        newErrors.duree = 'La date de fin doit être après la date de début';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const submitData = {
        ...form,
        boost: form.boost.periode.debut && form.boost.periode.fin ? {
          ...form.boost,
          periode: {
            debut: new Date(form.boost.periode.debut),
            fin: new Date(form.boost.periode.fin),
          },
        } : undefined,
        duree: form.duree.debut && form.duree.fin ? {
          debut: new Date(form.duree.debut),
          fin: new Date(form.duree.fin),
        } : undefined,
      };

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    }
  };

  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>{commission ? 'Modifier la commission' : 'Nouvelle commission'}</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Produit *</label>
            <select
              name="produit"
              value={form.produit}
              onChange={handleProduitChange}
              className={errors.produit ? styles.inputError : styles.input}
              required
            >
              <option value="">Sélectionner un produit</option>
              {produitsOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.produit && <span className={styles.error}>{errors.produit}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Label *</label>
            <input
              type="text"
              name="label"
              value={form.label}
              onChange={handleChange}
              className={errors.label ? styles.inputError : styles.input}
              placeholder="Nom affiché du produit"
              required
            />
            {errors.label && <span className={styles.error}>{errors.label}</span>}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Type *</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className={styles.input}
                required
              >
                <option value="fixe">Fixe (€)</option>
                <option value="variable">Variable (%)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Valeur *</label>
              <input
                type="number"
                name="valeur"
                value={form.valeur}
                onChange={handleChange}
                className={errors.valeur ? styles.inputError : styles.input}
                placeholder={form.type === 'fixe' ? '10' : '5'}
                min="0"
                step={form.type === 'variable' ? '0.1' : '1'}
                required
              />
              {errors.valeur && <span className={styles.error}>{errors.valeur}</span>}
            </div>
          </div>

          <div className={styles.section}>
            <h3>Boost (optionnel)</h3>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Type de boost</label>
                <select
                  value={form.boost.type}
                  onChange={(e) => handleBoostChange('type', e.target.value)}
                  className={styles.input}
                >
                  <option value="fixe">Fixe (€)</option>
                  <option value="variable">Variable (%)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Valeur du boost</label>
                <input
                  type="number"
                  value={form.boost.valeur}
                  onChange={(e) => handleBoostChange('valeur', e.target.value)}
                  className={styles.input}
                  placeholder="0"
                  min="0"
                  step={form.boost.type === 'variable' ? '0.1' : '1'}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Date de début</label>
                <input
                  type="date"
                  value={form.boost.periode.debut}
                  onChange={(e) => handleBoostChange('periode', { ...form.boost.periode, debut: e.target.value })}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Date de fin</label>
                <input
                  type="date"
                  value={form.boost.periode.fin}
                  onChange={(e) => handleBoostChange('periode', { ...form.boost.periode, fin: e.target.value })}
                  className={styles.input}
                />
              </div>
            </div>
            {errors.boostPeriode && <span className={styles.error}>{errors.boostPeriode}</span>}
          </div>

          <div className={styles.section}>
            <h3>Durée (optionnel)</h3>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Date de début</label>
                <input
                  type="date"
                  value={form.duree.debut}
                  onChange={(e) => handleDureeChange('debut', e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Date de fin</label>
                <input
                  type="date"
                  value={form.duree.fin}
                  onChange={(e) => handleDureeChange('fin', e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>
            {errors.duree && <span className={styles.error}>{errors.duree}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="actif"
                checked={form.actif}
                onChange={handleChange}
                className={styles.checkbox}
              />
              Commission active
            </label>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Enregistrement...' : (commission ? 'Modifier' : 'Créer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}