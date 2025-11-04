import React, { useState, useRef, useEffect } from 'react';
import './CurrencySelect.css';

export type CurrencyCode = 'INR' | 'USD';

interface CurrencySelectProps {
  value: CurrencyCode;
  onChange: (value: CurrencyCode) => void;
}

const CURRENCIES: { code: CurrencyCode; label: string; symbol: string; flag: string }[] = [
  { code: 'INR', label: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'USD', label: 'US Dollar', symbol: '$', flag: '🇺🇸' }
];

const CurrencySelect: React.FC<CurrencySelectProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const current = CURRENCIES.find(c => c.code === value) || CURRENCIES[0];

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!open) return;
      const t = triggerRef.current;
      const m = menuRef.current;
      if (t && t.contains(e.target as Node)) return;
      if (m && m.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const selectCurrency = (code: CurrencyCode) => {
    onChange(code);
    setOpen(false);
  };

  return (
    <div className={`currency-select ${open ? 'open' : ''}`}>
      <button
        ref={triggerRef}
        type="button"
        className="currency-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        <span className="currency-flag" aria-hidden>{current.flag}</span>
        <span className="currency-code">{current.code}</span>
        <span className="currency-symbol">{current.symbol}</span>
        <svg className="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div ref={menuRef} role="listbox" className="currency-menu">
          {CURRENCIES.map((c) => (
            <div
              key={c.code}
              role="option"
              aria-selected={c.code === value}
              className={`currency-option ${c.code === value ? 'selected' : ''}`}
              onClick={() => selectCurrency(c.code)}
            >
              <span className="currency-flag" aria-hidden>{c.flag}</span>
              <div className="currency-info">
                <span className="currency-code">{c.code}</span>
                <span className="currency-label">{c.label}</span>
              </div>
              <span className="currency-symbol">{c.symbol}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CurrencySelect;