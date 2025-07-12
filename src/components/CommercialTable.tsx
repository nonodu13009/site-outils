"use client";

import { useState } from 'react';
import styles from './CommercialTable.module.css';
import { FaBolt, FaCar, FaHeartbeat, FaStar, FaRegEye } from 'react-icons/fa';
import { PremiumModal } from './PremiumModal';
import { useCompagnies } from '@/hooks/useCompagnies';

export interface CommercialData {
  id: string;
  date_saisie: string;
  nom_client: string;
  num_contrat: string;
  date_effet: string;
  process: string;
  produit: string;
  compagnie: string;
  ca_vl: number;
  ca_mensuel: number;
  comm_potentielle: number;
  notes?: string;
}

interface CommercialTableProps {
  data: CommercialData[];
  loading?: boolean;
}

// Mapping des noms techniques vers des labels lisibles
const columnLabels: Record<keyof Omit<CommercialData, 'id' | 'ca_mensuel'>, string> = {
  date_saisie: 'Date de saisie',
  nom_client: 'Nom du client',
  num_contrat: 'N° Contrat',
  date_effet: 'Date d’effet',
  process: 'Processus',
  produit: 'Produit',
  compagnie: 'Compagnie',
  ca_vl: 'CA VL',
  comm_potentielle: 'Commission potentielle',
  notes: 'Notes',
};

const columnOrder: (keyof Omit<CommercialData, 'id' | 'ca_mensuel'>)[] = [
  'date_saisie',
  'nom_client',
  'num_contrat',
  'date_effet',
  'process',
  'produit',
  'compagnie',
  'ca_vl',
  'comm_potentielle',
  'notes',
];

// Liste des produits pour AN
const produitsAN = [
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

// Mapping process -> couleur
const processColors: Record<string, string> = {
  'M+3': '#007aff',
  'Préterme Auto': '#34c759',
  'Préterme Ird': '#ff9500',
  'AN': '#af52de',
};

// --- Début du composant tableau commercial, version "souligné" ---

// Fonction pour mettre en Title Case (y compris noms composés)
function formatClientName(name: string): string {
  return name
    .split(' ')
    .map(part =>
      part
        .split('-')
        .map(
          seg => seg.charAt(0).toUpperCase() + seg.slice(1).toLowerCase()
        )
        .join('-')
    )
    .join(' ');
}

export function CommercialTable({ data, loading = false }: CommercialTableProps) {
  const [sortField, setSortField] = useState<keyof CommercialData>('date_saisie');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null);
  // Remplacement de "any" par un type plus précis pour le formulaire
  const [form, setForm] = useState<Partial<CommercialData>>({});
  const [localRows, setLocalRows] = useState<CommercialData[]>([]);
  // Suppression de isSubmitting inutilisé (voir lint)
  // const [isSubmitting, setIsSubmitting] = useState(false);
  const [noteToRead, setNoteToRead] = useState<string | null>(null);
  const [readNoteOpen, setReadNoteOpen] = useState(false);
  const { compagnies, loading: loadingCompagnies, error: errorCompagnies } = useCompagnies();

  // Gestion du tri avec effet "souligné" sur l'en-tête actif
  const handleSort = (field: keyof CommercialData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Boutons flashy à afficher au-dessus du tableau
  const actionButtons = [
    { label: 'M+3', icon: <FaBolt />, color: '#007aff' },
    { label: 'Préterme Auto', icon: <FaCar />, color: '#34c759' },
    { label: 'Préterme Ird', icon: <FaHeartbeat />, color: '#ff9500' },
    { label: 'AN', icon: <FaStar />, color: '#af52de' },
  ];

  const handleOpenModal = (process: string) => {
    setSelectedProcess(process);
    setForm({
      date_saisie: new Date().toISOString().slice(0, 10),
      process,
      nom_client: '',
      notes: '',
      num_contrat: '',
      date_effet: '',
      produit: '',
      compagnie: '',
      ca_vl: 0,
      comm_potentielle: 0,
    });
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProcess(null);
  };

  // Gestion des champs (souligné)
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev: typeof form) => ({
      ...prev,
      [name]: name === 'ca_vl' || name === 'comm_potentielle' ? Number(value) : value,
    }));
  };

  // Calcul dynamique commission potentielle (pour AN)
  const computeCommission = () => {
    if (selectedProcess !== 'AN') return '';
    const produit = form.produit;
    const ca = typeof form.ca_vl === 'number' ? form.ca_vl : 0;
    switch (produit) {
      case 'auto':
      case 'moto':
      case 'nop50eur':
        return 10;
      case 'ird_part':
        return 20;
      case 'ird_pro':
        if (ca <= 999) return 20;
        return 20 + 10 * Math.floor((ca - 999) / 1000);
      case 'pj_part':
      case 'pj_pro':
        return 30;
      case 'sante':
      case 'prev':
        return 50;
      case 'vie_pp':
        return 50;
      case 'vie_pu':
        return Math.round(ca * 0.01);
      default:
        return '';
    }
  };

  // Ajout local d'un contrat à la validation de la modale
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Générer un id unique (timestamp + random)
    const id = Date.now().toString() + Math.floor(Math.random() * 10000);
    const newRow: CommercialData = {
      id,
      date_saisie: form.date_saisie || new Date().toISOString().slice(0, 10),
      nom_client: form.nom_client ? formatClientName(form.nom_client) : '',
      num_contrat: form.num_contrat || '',
      date_effet: form.date_effet || '',
      process: selectedProcess || '',
      produit: form.produit || '',
      compagnie: form.compagnie || '',
      ca_vl: typeof form.ca_vl === 'number' ? form.ca_vl : 0,
      ca_mensuel: 0,
      comm_potentielle: Number(computeCommission()) || 0,
      notes: form.notes || '',
    };
    setLocalRows((prev) => [newRow, ...prev]);
    setModalOpen(false);
    setSelectedProcess(null);
    setForm({});
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Chargement des données...</p>
        </div>
      </div>
    );
  }

  // On affiche les données locales si présentes, sinon les données props
  const displayData = localRows.length > 0 ? localRows : data;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Tableau de bord commercial</h2>
        <div className={styles.actionsRow}>
          {actionButtons.map((btn) => (
            <button
              key={btn.label}
              type="button"
              className={styles.flashyButton}
              style={{ background: btn.color }}
              aria-label={btn.label}
              tabIndex={0}
              onClick={() => handleOpenModal(btn.label)}
            >
              <span className={styles.btnIcon}>{btn.icon}</span>
              {btn.label}
            </button>
          ))}
        </div>
        {/* Ligne supprimée : nombre de contrats au total */}
      </div>
      {/* Modale premium process */}
      <PremiumModal
        open={modalOpen}
        onClose={handleCloseModal}
        title={selectedProcess ? `Nouveau process : ${selectedProcess}` : ''}
      >
        {selectedProcess && (
          <form
            style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}
            onSubmit={handleSubmit}
            autoComplete="off"
          >
            {/* Date de saisie (grisée) */}
            <div className={styles.PremiumModal_formGroup}>
              <label className={styles.label}>Date de saisie</label>
              <input
                type="date"
                name="date_saisie"
                value={form.date_saisie}
                disabled
                className={styles.input + ' ' + styles.inputDisabled}
              />
            </div>
            {/* Nom du process (grisé) */}
            <div className={styles.PremiumModal_formGroup}>
              <label className={styles.label}>Processus</label>
              <input
                type="text"
                name="process"
                value={selectedProcess}
                disabled
                className={styles.input + ' ' + styles.inputDisabled}
              />
            </div>
            {/* Nom du client */}
            <div className={styles.PremiumModal_formGroup}>
              <label className={styles.label}>Nom du client</label>
              <input
                type="text"
                name="nom_client"
                value={form.nom_client}
                onChange={handleChange}
                placeholder="Saisir le nom du client"
                className={styles.input}
                required
              />
            </div>
            {/* Champs spécifiques AN */}
            {selectedProcess === 'AN' && (
              <>
                <div className={styles.PremiumModal_formGroup}>
                  <label className={styles.label}>N° Contrat</label>
                  <input
                    type="text"
                    name="num_contrat"
                    value={form.num_contrat ?? ''}
                    onChange={handleChange}
                    placeholder="Numéro de contrat"
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.PremiumModal_formGroup}>
                  <label className={styles.label}>Date d&apos;effet</label>
                  <input
                    type="date"
                    name="date_effet"
                    value={form.date_effet ?? ''}
                    onChange={handleChange}
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.PremiumModal_formGroup}>
                  <label className={styles.label}>Produit</label>
                  <select
                    name="produit"
                    value={form.produit}
                    onChange={handleChange}
                    className={styles.input}
                    required
                  >
                    <option value="">Sélectionner un produit</option>
                    {produitsAN.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.PremiumModal_formGroup}>
                  <label className={styles.label}>Compagnie</label>
                  {loadingCompagnies ? (
                    <div style={{color:'#b0b0b8',fontSize:'1.05rem',padding:'0.7rem 0'}}>Chargement...</div>
                  ) : errorCompagnies ? (
                    <div style={{color:'#ff3b30',fontSize:'1.05rem',padding:'0.7rem 0'}}>Erreur lors du chargement des compagnies</div>
                  ) : (
                    <select
                      name="compagnie"
                      value={form.compagnie ?? ''}
                      onChange={handleChange}
                      className={styles.input}
                      required
                    >
                      <option value="">Sélectionner une compagnie</option>
                      {compagnies.map(c => (
                        <option key={c.id} value={c.nom}>{c.nom}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div className={styles.PremiumModal_formGroup}>
                  <label className={styles.label}>CA (en €)</label>
                  <input
                    type="number"
                    name="ca_vl"
                    value={form.ca_vl !== undefined ? String(form.ca_vl) : ''}
                    onChange={handleChange}
                    placeholder="Montant en euros"
                    className={styles.input}
                    min={0}
                    required
                  />
                </div>
              </>
            )}
            {/* Note (facultatif) - toujours en dernier */}
            <div className={styles.PremiumModal_formGroup}>
              <label className={styles.label}>Note (optionnelle)</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Ajouter une note..."
                className={styles.textarea}
                rows={2}
              />
            </div>
            {/* Boutons Valider / Annuler */}
            <div style={{ display: 'flex', gap: '1.2rem', justifyContent: 'flex-end', marginTop: '1.2rem' }}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={handleCloseModal}
              >Annuler</button>
              <button
                type="submit"
                className={styles.validateBtn}
              >Valider</button>
            </div>
          </form>
        )}
      </PremiumModal>
      
      <PremiumModal
        open={readNoteOpen}
        onClose={() => setReadNoteOpen(false)}
        title="Note"
      >
        <div style={{whiteSpace:'pre-line',fontSize:'1.08rem',color:'#1d1d1f',maxHeight:'40vh',overflowY:'auto',padding:'0.5rem 0'}}>
          {noteToRead}
        </div>
      </PremiumModal>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columnOrder.map((col) => (
                <th
                  key={col}
                  className={`${styles.th} ${styles.sortable}`}
                  onClick={() => handleSort(col as keyof CommercialData)}
                >
                  {columnLabels[col]}
                  {sortField === col && (
                    <span className={styles.sortIcon}>
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData.length === 0 ? (
              <tr>
                <td colSpan={columnOrder.length} className={styles.emptyState}>
                  <div className={styles.emptyContent}>
                    <p>Aucune donnée disponible</p>
                    <p className={styles.emptySubtext}>
                      Les contrats apparaîtront ici une fois saisis
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              [...displayData].sort((a, b) => {
                const aValue = a[sortField];
                const bValue = b[sortField];
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                  return sortDirection === 'asc' 
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
                }
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                  return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
                }
                return 0;
              }).map((row) => (
                <tr key={row.id} className={styles.row}>
                  {columnOrder.map((col) => (
                    <td key={col} className={styles.td}>
                      {col === 'date_saisie' || col === 'date_effet'
                        ? formatDate(row[col] as string)
                        : (col === 'ca_vl' || col === 'comm_potentielle') &&
                          (row.process === 'M+3' || row.process === 'Préterme Auto' || row.process === 'Préterme Ird')
                        ? <span style={{color:'#b0b0b8'}}>-</span>
                        : col === 'ca_vl' || col === 'comm_potentielle'
                        ? formatCurrency(row[col] as number)
                        : col === 'process'
                        ? <span
                            className={styles.processBadge}
                            style={{ background: processColors[row.process] || '#e5e5ea', color: '#fff' }}
                          >
                            {row[col] || '-'}
                          </span>
                        : col === 'notes'
                        ? row.notes && row.notes.trim() !== ''
                          ? <button
                              type="button"
                              className={styles.eyeBtn}
                              aria-label="Lire la note"
                              onClick={() => { setNoteToRead(row.notes || ''); setReadNoteOpen(true); }}
                            >
                              <FaRegEye style={{fontSize:'1.2em'}} />
                            </button>
                          : <span style={{color:'#b0b0b8'}}>-</span>
                        : row[col] || '-'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 