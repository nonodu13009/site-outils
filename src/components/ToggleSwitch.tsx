import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  id?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, disabled = false, label, id }) => {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', cursor: disabled ? 'not-allowed' : 'pointer', gap: 8 }}>
      <span style={{ position: 'relative', display: 'inline-block', width: 44, height: 26 }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          disabled={disabled}
          id={id}
          style={{ opacity: 0, width: 44, height: 26, position: 'absolute', left: 0, top: 0, margin: 0, zIndex: 2, cursor: disabled ? 'not-allowed' : 'pointer' }}
          aria-checked={checked}
          aria-label={label || 'Actif'}
        />
        <span
          aria-hidden="true"
          style={{
            display: 'block',
            width: 44,
            height: 26,
            background: checked ? '#34c759' : '#e5e5ea',
            borderRadius: 999,
            transition: 'background 0.18s',
            boxShadow: checked ? '0 2px 8px rgba(52,199,89,0.13)' : 'none',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: 3,
              left: checked ? 22 : 3,
              width: 20,
              height: 20,
              background: '#fff',
              borderRadius: '50%',
              boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
              transition: 'left 0.18s',
              border: '1.5px solid #e5e5ea',
            }}
          />
        </span>
      </span>
      {label && <span style={{ fontSize: '1rem', color: '#1d1d1f', fontWeight: 500 }}>{label}</span>}
    </label>
  );
}; 