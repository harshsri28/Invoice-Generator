import React from 'react';
import { useNavigate } from 'react-router-dom';

const ThankYou: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={{ maxWidth: 720, margin: '60px auto', padding: 24, textAlign: 'center' }}>
      <h1>Thank you for downloading!</h1>
      <p>Your PDF should start downloading automatically. If it didn't, you can try again from the invoice page or check the same invoice in your dashboard.</p>
      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 12 }}>
        <button onClick={() => navigate('/create-invoice')} style={{ padding: '10px 16px' }}>Try Again</button>
        <button onClick={() => navigate('/dashboard')} style={{ padding: '10px 16px' }}>Go to Dashboard</button>
      </div>
    </div>
  );
};

export default ThankYou;