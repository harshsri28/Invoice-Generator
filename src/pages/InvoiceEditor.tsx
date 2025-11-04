import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getInvoiceById, updateInvoice, setAuthToken } from '../services/api';
import './InvoiceEditor.css';
import '../components/InvoiceGenerator.css';
import InvoiceItems from '../components/InvoiceItems';
import InvoiceDisplay, { InvoiceDisplayHandle } from '../components/InvoiceDisplay';
import BillFromForm from '../components/BillFromForm';
import UserInfoForm from '../components/UserInfoForm';
import ExtraCharges, { ExtraCharge } from '../components/ExtraCharges';
import CurrencySelect from '../components/CurrencySelect';

// Local types mirrored from Create Invoice page
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

const InvoiceEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<any | null>(null);

  // Shared UI state (same as Create Invoice)
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
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  // Derive subtotal from items to avoid unused setter lint error in CI
  const subtotal = useMemo<number>(() => {
    return items.reduce((sum, item) => sum + (Number(item.itemCost) || 0), 0);
  }, [items]);
  const displayRef = React.useRef<InvoiceDisplayHandle>(null);
  const [extraCharges, setExtraCharges] = useState<ExtraCharge[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [invoiceName, setInvoiceName] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      try {
        if (token) setAuthToken(token);
        if (!id) throw new Error('Missing invoice id');
        const inv = await getInvoiceById(id);
        setInvoice(inv);

        // Map loaded invoice into shared UI state
        setCurrency((inv.currency as 'INR' | 'USD') || 'INR');
        setBillFrom({
          companyName: inv.bill_from_entity?.name || '',
          companyAddress: inv.bill_from_entity?.address || '',
          companyPhone: inv.bill_from_entity?.phone || '',
          companyEmail: inv.bill_from_entity?.email || '',
          gstNumber: inv.bill_from_entity?.gst_number || ''
        });
        setUserInfo({
          name: inv.bill_to_entity?.name || '',
          address: inv.bill_to_entity?.address || '',
          phoneNumber: inv.bill_to_entity?.phone || '',
          date: (inv.invoice_date || new Date().toISOString()).slice(0, 10)
        });
        setInvoiceName(inv.invoice_name || '');
        // Replace items mapping to split normal items and extra charges
        const regularItems = (inv.items || [])
          .filter((i: any) => !i.is_extra_cost)
          .map((i: any, idx: number) => ({ id: idx || Date.now() + idx, itemName: i.name, itemCost: Number(i.cost) || 0 }));
        const charges = (inv.items || [])
          .filter((i: any) => i.is_extra_cost)
          .map((c: any, idx: number) => ({ id: Date.now() + idx, name: c.name, type: 'fixed' as const, value: Number(c.cost) || 0 }));
        setItems(regularItems);
        setExtraCharges(charges);
      } catch (e: any) {
        console.error('Failed to load invoice', e);
        setError('Unable to load invoice');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, token]);

  useEffect(() => {
    const chargesTotal = extraCharges.reduce((sum, charge) => {
      if (charge.type === 'percent') {
        return sum + (subtotal * (Number(charge.value) || 0)) / 100;
      }
      return sum + (Number(charge.value) || 0);
    }, 0);
    setTotal(subtotal + chargesTotal);
  }, [subtotal, extraCharges]);

  const handleUserInfoChange = (field: keyof UserInfo, value: string) => {
    setUserInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleBillFromChange = (field: keyof BillFromInfo, value: string) => {
    setBillFrom(prev => ({ ...prev, [field]: value }));
  };

  const handleItemsChange = (newItems: InvoiceItem[]) => {
    setItems(newItems);
  };

  // Fix duplicate setError and ensure saving flags
  const save = async (navigateAfter: boolean = true) => {
    try {
      setError(null);
      setSaveError(null);
      setSaving(true);
      if (token) setAuthToken(token);
      const payload: any = {
        invoice_number: invoice?.invoice_number || `INV-${Date.now()}`,
        invoice_name: invoiceName?.trim() || undefined,
        invoice_date: userInfo.date,
        currency,
        bill_from: {
          name: billFrom.companyName,
          address: billFrom.companyAddress || undefined,
          phone: billFrom.companyPhone || undefined,
          email: billFrom.companyEmail || undefined,
          gst_number: billFrom.gstNumber || undefined
        },
        bill_to: {
          name: userInfo.name,
          address: userInfo.address || undefined,
          phone: userInfo.phoneNumber || undefined,
          email: undefined,
          gst_number: undefined
        },
        items: [
          ...items.map(i => ({ name: i.itemName || 'Item', cost: Number(i.itemCost) || 0, is_extra_cost: false })),
          ...extraCharges.map(c => ({ name: c.name || (c.type === 'percent' ? 'Percent charge' : 'Fixed charge'), cost: c.type === 'percent' ? (subtotal * (Number(c.value) || 0)) / 100 : Number(c.value) || 0, is_extra_cost: true }))
        ]
      };

      const updated = await updateInvoice(id!, payload);
      setInvoice(updated);
      if (navigateAfter) navigate('/dashboard');
    } catch (e: any) {
      console.error('Failed to save invoice', e);
      setSaveError(e?.message || 'Unable to save invoice');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="editor-loading">Loading...</div>;
  if (error) return <div className="editor-error">{error}</div>;
  if (!invoice) return null;

  // Use same layout and styling classes as Create Invoice page
  return (
    <div className="invoice-generator">
      <header className="invoice-generator-header">
        <h1>Edit Invoice</h1>
        <p>Update details and preview changes before saving</p>
        <button className="back-button" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
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
            invoiceNumber={invoice?.invoice_number}
          />
        </div>

        <div className="invoice-form-section">
          <BillFromForm billFrom={billFrom} onBillFromChange={handleBillFromChange} />
          <UserInfoForm userInfo={userInfo} onUserInfoChange={handleUserInfoChange} />

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
            <button className="save-draft-button" onClick={() => save(true)} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button className="generate-pdf-button" onClick={async () => {
              try {
                setSaveError(null);
                setSaving(true);
                if (token) setAuthToken(token);
                // Save changes first
                await save(false);
                // Then generate PDF
                await displayRef.current?.downloadPDF();
                navigate('/thank-you');
              } catch (err: any) {
                console.error('Generate PDF failed:', err);
                setSaveError('Failed to generate PDF. Try again from dashboard.');
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

export default InvoiceEditor;