import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

const PATH_COLORS = [
  { value: 'Red', te: 'ఎరుపు' }, { value: 'Blue', te: 'నీలం' },
  { value: 'Green', te: 'ఆకుపచ్చ' }, { value: 'Yellow', te: 'పసుపు' },
  { value: 'Orange', te: 'నారింజ' }, { value: 'Purple', te: 'ఊదా' },
  { value: 'Pink', te: 'గులాబీ' }, { value: 'Brown', te: 'గోధుమ' },
  { value: 'Black', te: 'నలుపు' }, { value: 'White', te: 'తెలుపు' },
  { value: 'Gold', te: 'బంగారు' }, { value: 'Silver', te: 'వెండి' }
];

export default function TeamLogin() {
  const [pincode, setPincode] = useState('');
  const [pathColor, setPathColor] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginTeam } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pincode || !pathColor) return toast.error(language === 'te' ? 'అన్ని వివరాలు నమోదు చేయండి' : 'Enter all details');
    setLoading(true);
    try {
      await loginTeam(pincode, pathColor);
      toast.success(language === 'te' ? 'శుభాకాంక్షలు! ఆట ప్రారంభమైంది!' : 'Welcome! Game started!');
      navigate('/game');
    } catch (err) {
      toast.error(err.response?.data?.error || (language === 'te' ? 'తప్పు వివరాలు' : 'Invalid credentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: 'calc(100vh - 60px)', padding: '2rem' }}>
      <div className="card treasure-border fade-in" style={{ width: '100%', maxWidth: '420px' }}>
        <div className="text-center mb-3">
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏃</div>
          <h2 className="modal-title">{t('teamLogin')}</h2>
          <p className="text-sm text-muted telugu-text">
            {language === 'te'
              ? 'నమోదు సమయంలో ఇచ్చిన పిన్‌కోడ్ మరియు మార్గం రంగు నమోదు చేయండి'
              : 'Enter the pincode and path color given during registration'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>{t('pincode')}</label>
            <input
              type="text"
              value={pincode}
              onChange={e => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder={language === 'te' ? '4 అంకెల పిన్‌కోడ్' : '4-digit pincode'}
              inputMode="numeric"
              autoFocus
            />
          </div>

          <div className="input-group">
            <label>{t('pathColor')}</label>
            <select value={pathColor} onChange={e => setPathColor(e.target.value)}>
              <option value="">{language === 'te' ? 'రంగు ఎంచుకోండి' : 'Select color'}</option>
              {PATH_COLORS.map(c => (
                <option key={c.value} value={c.value}>
                  {language === 'te' ? `${c.te} (${c.value})` : c.value}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem' }} disabled={loading}>
            {loading ? '...' : `🗺️ ${t('login')}`}
          </button>
        </form>

        <div className="card mt-2" style={{ background: 'rgba(212,168,67,0.05)', border: '1px solid rgba(212,168,67,0.2)' }}>
          <p className="text-sm telugu-text text-secondary">
            💡 {language === 'te'
              ? 'మీ పిన్‌కోడ్ మరియు మార్గం రంగు నమోదు సమయంలో నిర్వాహకుడు ఇచ్చారు.'
              : 'Your pincode and path color were given by the host during team registration.'}
          </p>
        </div>
      </div>
    </div>
  );
}
