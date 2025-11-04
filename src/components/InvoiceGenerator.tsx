import React, { useState, useEffect } from 'react';
import UserInfoForm from './UserInfoForm';
import InvoiceItems from './InvoiceItems';
import InvoiceDisplay, { InvoiceDisplayHandle } from './InvoiceDisplay';
import BillFromForm from './BillFromForm';
import ExtraCharges, { ExtraCharge } from './ExtraCharges';
import './InvoiceGenerator.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createInvoice, setAuthToken } from '../services/api';
import CurrencySelect from './CurrencySelect';

interface UserInfo {
  name: string;
  date: string;
  address: string;
  phoneNumber: string;
}

interface BillFromInfo {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  gstNumber?: string;
}

interface InvoiceItem {
  id: number;
  itemName: string;
  itemCost: number;
}

const InvoiceGenerator: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    date: new Date().toISOString().split('T')[0],
    address: '',
    phoneNumber: ''
  });

  const [billFrom, setBillFrom] = useState<BillFromInfo>({
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    gstNumber: ''
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: Date.now(), itemName: '', itemCost: 0 }
  ]);

  const [subtotal, setSubtotal] = useState<number>(0);
  const [extraCharges, setExtraCharges] = useState<ExtraCharge[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [invoiceName, setInvoiceName] = useState<string>('');
  const navigate = useNavigate();
  const { token } = useAuth();
  const displayRef = React.useRef<InvoiceDisplayHandle>(null);

  // Automatic subtotal calculation
  useEffect(() => {
    const calculatedSubtotal = items.reduce((sum, item) => sum + (Number(item.itemCost) || 0), 0);
    setSubtotal(calculatedSubtotal);
  }, [items]);

  // Recalculate total when extra charges or subtotal change
  useEffect(() => {
    const chargesTotal = extraCharges.reduce((sum, charge) => {
      if (charge.type === 'percent') {
        return sum + (subtotal * (Number(charge.value) || 0)) / 100;
      }
      return sum + (Number(charge.value) || 0);
    }, 0);
    setTotal(subtotal + chargesTotal);
  }, [extraCharges, subtotal]);

  const handleUserInfoChange = (field: keyof UserInfo, value: string) => {
    setUserInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBillFromChange = (field: keyof BillFromInfo, value: string) => {
    setBillFrom(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemsChange = (newItems: InvoiceItem[]) => {
    setItems(newItems);
  };

  const buildPayload = () => ({
    bill_from: {
      name: billFrom.companyName,
      address: billFrom.companyAddress || null,
      phone: billFrom.companyPhone || null,
      email: billFrom.companyEmail || null,
      gst_number: billFrom.gstNumber || null,
    },
    bill_to: {
      name: userInfo.name,
      address: userInfo.address || null,
      phone: userInfo.phoneNumber || null,
      email: null,
      gst_number: null,
    },
    invoice_number: `INV-${Date.now()}`,
    invoice_name: invoiceName?.trim() || undefined,
    invoice_date: userInfo.date,
    items: [
      ...items.map(i => ({ name: i.itemName || 'Item', cost: Number(i.itemCost) || 0 })),
      ...extraCharges.map(c => {
        const amount = c.type === 'percent'
          ? (subtotal * (Number(c.value) || 0)) / 100
          : Number(c.value) || 0;
        return {
          name: c.name || (c.type === 'percent' ? 'Percent charge' : 'Fixed charge'),
          cost: amount,
          is_extra_cost: true,
        };
      }),
    ],

    currency,
  });

  return (
    <div className="invoice-generator">
      <header className="invoice-generator-header">
        <h1>Create Invoice</h1>
        <p>Fill in the details to create a professional invoice</p>
      </header>

      <div className="invoice-meta-bar">
        <div className="meta-group">
          <label className="meta-label">Invoice Name</label>
          <input
            className="invoice-name-input"
            type="text"
            placeholder="e.g., March Website Design"
            value={invoiceName}
            onChange={(e) => setInvoiceName(e.target.value)}
          />
        </div>
        <div className="meta-group">
          <label className="meta-label">Currency</label>
          <CurrencySelect value={currency} onChange={(val) => setCurrency(val)} />
        </div>
      </div>
      
      <main className="invoice-generator-main">
        <div className="invoice-preview-section">
          <h2>Invoice Preview</h2>
          <InvoiceDisplay 
            ref={displayRef}
            billFrom={billFrom}
            userInfo={userInfo} 
            items={items} 
            total={total} 
            subtotal={subtotal}
            extraCharges={extraCharges}
          />
        </div>

        <div className="invoice-form-section">
          <BillFromForm
            billFrom={billFrom}
            onBillFromChange={handleBillFromChange}
          />
          <UserInfoForm 
            userInfo={userInfo} 
            onUserInfoChange={handleUserInfoChange} 
          />

          {/* Removed duplicate Currency and Invoice Name fields from middle form */}

          <InvoiceItems items={items} onItemsChange={handleItemsChange} />

          <ExtraCharges charges={extraCharges} onChargesChange={setExtraCharges} subtotal={subtotal} />

          <div className="total-display">
            <h3>Total Amount: ₹{total.toFixed(2)}</h3>
          </div>

          {saveError && (
            <div className="save-error" style={{ color: '#e53e3e', marginTop: 8 }}>
              {saveError}
            </div>
          )}

          <div className="invoice-actions">
            <button
              className="save-draft-button"
              onClick={async () => {
                try {
                  setSaveError(null);
                  setSaving(true);
                  if (token) setAuthToken(token);
                  const payload = buildPayload();
                  const created = await createInvoice(payload);
                  navigate('/dashboard');
                } catch (err: any) {
                  console.error('Save draft failed:', err);
                  setSaveError(err?.message || 'Failed to save.');
                } finally {
                  setSaving(false);
                }
              }}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button className="generate-pdf-button" onClick={async () => {
              try {
                setSaveError(null);
                setSaving(true);
                await displayRef.current?.downloadPDF();
                navigate('/thank-you');
              } catch (err: any) {
                console.error('Generate PDF failed:', err);
                setSaveError('Failed to generate PDF. Try again.');
              } finally {
                setSaving(false);
              }
            }}>Generate PDF</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InvoiceGenerator;