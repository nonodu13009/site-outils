import { useEffect, useRef } from 'react';
import styles from './PremiumModal.module.css';

interface PremiumModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function PremiumModal({ open, onClose, title, description, children }: PremiumModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap & fermeture ESC
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      // Tab trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.overlay} aria-modal="true" role="dialog" tabIndex={-1}>
      <div className={styles.modal} ref={modalRef}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Fermer la modale">×</button>
        <h2 className={styles.title}>{title}</h2>
        {description && <p className={styles.description}>{description}</p>}
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
} 