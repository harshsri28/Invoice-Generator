import React, { useState, useEffect } from 'react';
import UserInfoForm from './components/UserInfoForm';
import InvoiceItems from './components/InvoiceItems';
import InvoiceDisplay from './components/InvoiceDisplay';
import './App.css';
import BillFromForm from './components/BillFromForm';

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

  const [total, setTotal] = useState<number>(0);

  // Automatic total calculation
  useEffect(() => {
    const calculatedTotal = items.reduce((sum, item) => sum + item.itemCost, 0);
    setTotal(calculatedTotal);
  }, [items]);

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
          />
        </div>
      </main>
    </div>
  );
}

export default App;
