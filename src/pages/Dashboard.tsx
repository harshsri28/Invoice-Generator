import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getInvoices, setAuthToken, InvoiceSummary } from '../services/api';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (token) setAuthToken(token);
        const { invoices } = await getInvoices(1, 10);
        setInvoices(invoices);
      } catch (err: any) {
        console.error('Failed to fetch invoices:', err);
        setError('Unable to load invoices. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleCreateInvoice = () => {
    navigate('/create-invoice');
  };

  const formatCurrency = (amount: number, currency: 'INR' | 'USD' = 'INR') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your invoices...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="dashboard-title">Invoice Generator</h1>
            <p className="dashboard-subtitle">Welcome back, {user?.name}</p>
          </div>
          <div className="header-right">
            <div className="user-info">
              {user?.profile_picture_url && (
                <img 
                  src={user.profile_picture_url} 
                  alt={user.name} 
                  className="user-avatar"
                />
              )}
              <span className="user-name">{user?.name}</span>
            </div>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-actions">
          <h2 className="section-title">Your Invoices</h2>
          <button onClick={handleCreateInvoice} className="create-invoice-button">
            Create New Invoice
          </button>
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        {/* Invoice List */}
        <div className="invoice-list">
          {invoices.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📄</div>
              <h3>No invoices yet</h3>
              <p>Create your first invoice to get started</p>
              <button onClick={handleCreateInvoice} className="create-first-invoice-button">
                Create First Invoice
              </button>
            </div>
          ) : (
            <div className="invoice-grid">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="invoice-card" onClick={() => navigate(`/invoice/${invoice.id}`)}>
                  <div className="invoice-header">
                    <div className="invoice-number">{invoice.invoice_name || invoice.invoice_number}</div>

                  </div>
                  
                  <div className="invoice-details">
                    <div className="invoice-client">
                      <span className="detail-label">Bill To:</span>
                      <span className="detail-value">{invoice.bill_to_entity?.name}</span>
                    </div>
                    
                    <div className="invoice-date">
                      <span className="detail-label">Date:</span>
                      <span className="detail-value">{formatDate(invoice.invoice_date)}</span>
                    </div>
                    
                    <div className="invoice-amount">
                      <span className="detail-label">Amount:</span>
                      <span className="detail-value amount">{formatCurrency(invoice.total_cost, invoice.currency)}</span>
                    </div>
                  </div>
                  
                  <div className="invoice-footer">
                    <span className="created-date">
                      Created {formatDate(invoice.invoice_date)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;