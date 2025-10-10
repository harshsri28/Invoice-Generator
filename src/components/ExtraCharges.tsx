import React from 'react';
import './ExtraCharges.css';

export type ChargeType = 'percent' | 'fixed';

export interface ExtraCharge {
  id: number;
  name: string;
  type: ChargeType;
  value: number; // percent value (e.g., 18) or fixed amount (e.g., 50)
}

interface ExtraChargesProps {
  charges: ExtraCharge[];
  onChargesChange: (charges: ExtraCharge[]) => void;
  subtotal: number;
}

const ExtraCharges: React.FC<ExtraChargesProps> = ({ charges, onChargesChange, subtotal }) => {
  const addCharge = () => {
    const newCharge: ExtraCharge = {
      id: Date.now(),
      name: '',
      type: 'percent',
      value: 0,
    };
    onChargesChange([...charges, newCharge]);
  };

  const removeCharge = (id: number) => {
    onChargesChange(charges.filter(c => c.id !== id));
  };

  const updateCharge = (id: number, field: keyof ExtraCharge, value: any) => {
    onChargesChange(charges.map(c => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

  const computeChargeAmount = (charge: ExtraCharge) => {
    if (charge.type === 'percent') {
      return (subtotal * (Number(charge.value) || 0)) / 100;
    }
    return Number(charge.value) || 0;
  };

  const chargesTotal = charges.reduce((sum, c) => sum + computeChargeAmount(c), 0);
  const finalTotal = subtotal + chargesTotal;

  return (
    <div className="extra-charges">
      <h2>Extra Charges (Optional)</h2>
      <div className="charges-list">
        {charges.map((charge) => (
          <div key={charge.id} className="charge-row">
            <input
              type="text"
              placeholder="Charge name (e.g., GST, Handling)"
              value={charge.name}
              onChange={(e) => updateCharge(charge.id, 'name', e.target.value)}
              className="charge-name-input"
            />
            <select
              value={charge.type}
              onChange={(e) => updateCharge(charge.id, 'type', e.target.value as ChargeType)}
              className="charge-type-select"
            >
              <option value="percent">Percent %</option>
              <option value="fixed">Fixed Amount</option>
            </select>
            <input
              type="number"
              placeholder={charge.type === 'percent' ? 'Percent (e.g., 18)' : 'Amount (e.g., 50)'}
              value={charge.value || ''}
              onChange={(e) => updateCharge(charge.id, 'value', Number(e.target.value) || 0)}
              className="charge-value-input"
              min="0"
              step="0.01"
            />
            <div className="charge-amount">
              {charge.name ? <span>{charge.name}:</span> : <span>Charge:</span>} {formatCurrency(computeChargeAmount(charge))}
            </div>
            <button
              type="button"
              onClick={() => removeCharge(charge.id)}
              className="remove-charge-btn"
              disabled={charges.length === 0}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={addCharge} className="add-charge-btn">
        Add Extra Charge
      </button>

      <div className="charges-summary">
        <div className="summary-row">
          <span>Subtotal:</span>
          <strong>{formatCurrency(subtotal)}</strong>
        </div>
        {charges.map((charge) => (
          <div key={`sum-${charge.id}`} className="summary-row">
            <span>{charge.name || (charge.type === 'percent' ? 'Percent charge' : 'Fixed charge')} ({charge.type === 'percent' ? `${charge.value}%` : formatCurrency(charge.value)}):</span>
            <strong>{formatCurrency(computeChargeAmount(charge))}</strong>
          </div>
        ))}
        <div className="summary-row total">
          <span>Total with charges:</span>
          <strong>{formatCurrency(finalTotal)}</strong>
        </div>
      </div>
    </div>
  );
};
export default ExtraCharges;