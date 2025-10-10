import React, { useState, useEffect } from 'react';
import UserInfoForm from './components/UserInfoForm';
import InvoiceItems from './components/InvoiceItems';
import InvoiceDisplay from './components/InvoiceDisplay';
import './App.css';
import BillFromForm from './components/BillFromForm';
import ExtraCharges, { ExtraCharge } from './components/ExtraCharges';

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

function App() {
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

  return (
    <div className="App">
      <header className="app-header">
        <h1>Invoice Generator</h1>
        <p>Create professional invoices quickly and easily</p>
      </header>
      
      <main className="app-main">
        <div className="form-section">
          <BillFromForm
            billFrom={billFrom}
            onBillFromChange={handleBillFromChange}
          />
          <UserInfoForm 
            userInfo={userInfo} 
            onUserInfoChange={handleUserInfoChange} 
          />
          
          <InvoiceItems 
            items={items} 
            onItemsChange={handleItemsChange} 
          />
          
          <ExtraCharges
            charges={extraCharges}
            onChargesChange={setExtraCharges}
            subtotal={subtotal}
          />
          
          <div className="total-display">
            <h3>Total Amount: ₹{total.toFixed(2)}</h3>
          </div>
        </div>
        
        <div className="invoice-section">
          <h2>Invoice Preview</h2>
          <InvoiceDisplay 
            billFrom={billFrom}
            userInfo={userInfo} 
            items={items} 
            total={total} 
            subtotal={subtotal}
            extraCharges={extraCharges}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
