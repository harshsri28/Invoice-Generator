import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001/api',
  withCredentials: true
});

// Accept string or null to clear Authorization header when logging out
export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

// Auth
export interface GoogleAuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    profile_picture_url?: string;
    created_at?: string;
  };
}

// Backend expects { credential } in body
export async function postGoogleAuth(credential: string): Promise<GoogleAuthResponse> {
  const response = await api.post('/auth/google', { credential });
  return response.data as GoogleAuthResponse;
}

export async function refreshToken(refreshToken: string) {
  const response = await api.post('/auth/refresh', { refreshToken });
  return response.data as { token: string };
}

export async function postLogout() {
  const response = await api.post('/auth/logout');
  return response.data as { message: string };
}

export async function getUserProfile() {
  const response = await api.get('/users/profile');
  return response.data as {
    id: string;
    email: string;
    name: string;
    profile_picture_url?: string;
  };
}

// Invoices
export interface EntitySummary {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  gst_number?: string;
}

export interface InvoiceSummary {
  id: string;
  invoice_number: string;
  invoice_name?: string;
  invoice_date: string;
  total_cost: number;
  currency: 'INR' | 'USD';
  bill_to_entity?: EntitySummary;
  bill_from_entity?: EntitySummary;
}

export async function getInvoices(page: number, limit: number) {
  const response = await api.get('/invoices', { params: { page, limit } });
  return response.data as {
    invoices: InvoiceSummary[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export async function getInvoiceById(id: string) {
  const response = await api.get(`/invoices/${id}`);
  return response.data.invoice as {
    id: string;
    bill_from_entity: EntitySummary;
    bill_to_entity: EntitySummary;
    invoice_number: string;
    invoice_name?: string;
    invoice_date: string;
    items: { id: string; name: string; cost: number; is_extra_cost: boolean; created_at: string }[];
    total_cost: number;
    currency: 'INR' | 'USD';
  };
}

export async function createInvoice(payload: any) {
  const response = await api.post('/invoices', payload);
  return response.data as { message: string; invoice: any };
}

export async function updateInvoice(id: string, payload: any) {
  const response = await api.put(`/invoices/${id}`, payload);
  return response.data.invoice;
}