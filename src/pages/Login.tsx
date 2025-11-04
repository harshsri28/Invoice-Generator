import React, { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setLoading(true);
    setError(null);
    try {
      await login(credentialResponse);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setError(err?.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.log('Google Sign-In Error');
    setError('Google Sign-In failed. Please try again.');
  };

  const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
  const hasGoogleClientId = !!GOOGLE_CLIENT_ID;

  return (
    hasGoogleClientId ? (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <h1>Invoice Generator</h1>
              <p>Sign in to manage your invoices</p>
            </div>
            <div className="login-form">
              {error && <div className="error-message">{error}</div>}
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
              />
            </div>
            <div className="login-footer">
              <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
            </div>
          </div>
        </div>
      </GoogleOAuthProvider>
    ) : (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>Invoice Generator</h1>
            <p>Sign in to manage your invoices</p>
          </div>
          <div className="login-form">
            {error && <div className="error-message">{error}</div>}
            <p className="login-note">Google Sign-In is not configured. Please set REACT_APP_GOOGLE_CLIENT_ID.</p>
          </div>
          <div className="login-footer">
            <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
          </div>
        </div>
      </div>
    )
  );
};

export default Login;