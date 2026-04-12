import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

export default function HostLogin() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginHost } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return toast.error('Password required');
    setLoading(true);
    try {
      await loginHost(password);
      toast.success(language === 'te' ? 'స్వాగతం, నిర్వాహకుడా!' : 'Welcome, Host!');
      navigate('/host');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: 'calc(100vh - 60px)', padding: '2rem' }}>
      <div className="card treasure-border fade-in" style={{ width: '100%', maxWidth: '420px' }}>
        <div className="text-center mb-3">
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>👑</div>
          <h2 className="modal-title">{t('hostLogin')}</h2>
          <p className="text-sm text-muted telugu-text">
            {language === 'te' ? 'నిర్వాహకుడి పాస్‌వర్డ్ నమోదు చేయండి' : 'Enter host password to continue'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>{t('password')}</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={language === 'te' ? 'పాస్‌వర్డ్ నమోదు చేయండి' : 'Enter password'}
              autoFocus
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem' }} disabled={loading}>
            {loading ? '...' : `👑 ${t('login')}`}
          </button>
        </form>
      </div>
    </div>
  );
}
