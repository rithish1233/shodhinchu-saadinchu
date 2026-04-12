import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import QRScanner from '../components/QRScanner';

export default function TeamGame() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [clueData, setClueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  // ✅ Synchronous guard — state updates are async and too slow to prevent duplicate calls
  const isValidatingRef = useRef(false);

  const fetchClue = useCallback(async () => {
    try {
      const res = await axios.get('/game/current-clue');
      setClueData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClue();
  }, [fetchClue]);

  const validateCode = useCallback(async (code) => {
    if (!code || !code.trim()) {
      return toast.error(language === 'te' ? 'కోడ్ నమోదు చేయండి' : 'Enter code');
    }

    // ✅ Synchronous ref check blocks any duplicate before state can catch up
    if (isValidatingRef.current) return;
    isValidatingRef.current = true;

    setValidating(true);
    setShowScanner(false);
    setLastResult(null); // ✅ clear previous result immediately

    try {
      const res = await axios.post('/game/validate-code', { code: code.trim() });

      if (res.data.success) {
        if (res.data.status === 'completed') {
          toast.success('🎉 ' + (language === 'te' ? res.data.messageInTelugu : res.data.message), { duration: 5000 });
        } else {
          toast.success(language === 'te' ? res.data.messageInTelugu : res.data.message);
        }
        setManualCode('');
        setShowManual(false);
        setLastResult(null); // ✅ no error card on success
        await fetchClue();
      } else {
        setLastResult(res.data);
      }
    } catch (err) {
      const errMsg = err.response?.data?.errorInTelugu && language === 'te'
        ? err.response.data.errorInTelugu
        : err.response?.data?.error || 'Validation failed';

      // ✅ dismiss any existing toasts first, then show one with a fixed id
      toast.dismiss();
      toast.error(errMsg, { id: 'validate-err', duration: 3000 });

      setLastResult({ success: false, error: errMsg });
    } finally {
      isValidatingRef.current = false; // ✅ release lock
      setValidating(false);
    }
  }, [language, fetchClue]);

  // ✅ stable reference — won't cause QRScanner to remount
  const handleScan = useCallback((decodedText) => {
    validateCode(decodedText);
  }, [validateCode]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    validateCode(manualCode);
  };

  if (loading) return <div className="flex-center" style={{ height: '80vh' }}><div className="spinner"></div></div>;
  if (!clueData) return null;

  const colorMap = {
    Red: '#e74c3c', Blue: '#3498db', Green: '#2ecc71', Yellow: '#f1c40f',
    Orange: '#e67e22', Purple: '#9b59b6', Pink: '#e91e8c', Brown: '#795548',
    Black: '#546e7a', White: '#ecf0f1', Gold: '#f39c12', Silver: '#95a5a6'
  };
  const pathColorHex = colorMap[user?.pathColor] || '#d4a843';

  // COMPLETED STATE
  if (clueData.status === 'completed') {
    return (
      <div className="flex-center" style={{ minHeight: 'calc(100vh - 60px)', padding: '2rem' }}>
        <div className="card text-center fade-in" style={{
          maxWidth: '500px', width: '100%',
          border: '2px solid var(--accent-gold)',
          background: 'rgba(212,168,67,0.08)'
        }}>
          <div style={{ fontSize: '5rem', marginBottom: '1rem', animation: 'pulse 1s ease-in-out infinite' }}>
            🏆
          </div>
          <h1 style={{ fontFamily: "'Cinzel Decorative', serif", color: 'var(--accent-gold)', fontSize: '1.8rem', marginBottom: '0.5rem' }}>
            {language === 'te' ? 'అభినందనలు!' : 'Congratulations!'}
          </h1>
          <p className="telugu-text" style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            {language === 'te' ? 'మీరు నిధి వేటను పూర్తి చేశారు!' : 'You completed the Treasure Hunt!'}
          </p>

          {clueData.completionTime && (
            <div className="card" style={{ background: 'rgba(0,0,0,0.3)', marginBottom: '1rem' }}>
              <div className="text-muted text-sm">{t('yourTime')}</div>
              <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--accent-gold)', fontFamily: 'monospace' }}>
                {clueData.completionTime}
              </div>
              <div className="text-muted text-sm">{t('minutes')}</div>
            </div>
          )}

          <div style={{ fontSize: '2rem', letterSpacing: '0.5rem', color: 'var(--accent-gold)', opacity: 0.5 }}>
            ✦ ✦ ✦
          </div>

          <p className="telugu-text text-sm text-muted mt-2">
            {language === 'te'
              ? 'నిర్వాహకుడి వద్దకు వెళ్ళండి మరియు ఫలితాలు తెలుసుకోండి!'
              : 'Go to the host desk to see final results!'}
          </p>
        </div>
      </div>
    );
  }

  const progressPct = ((clueData.completedSteps || 0) / (clueData.totalSteps || 5)) * 100;

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', padding: '1rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>

        {/* Team header */}
        <div className="card mb-2 fade-in" style={{
          borderColor: pathColorHex + '55',
          background: `linear-gradient(135deg, rgba(0,0,0,0.3), ${pathColorHex}11)`
        }}>
          <div className="flex-between">
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{user?.teamName}</div>
              <div className="text-sm" style={{ color: pathColorHex }}>
                ● {user?.pathColor} {language === 'te' ? 'మార్గం' : 'Path'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted">{t('progress')}</div>
              <div style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>
                {clueData.completedSteps}/{clueData.totalSteps}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="progress-bar mt-1" style={{ height: '6px' }}>
            <div className="progress-fill" style={{ width: `${progressPct}%` }}></div>
          </div>

          {/* Steps indicator */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            {Array(clueData.totalSteps).fill(null).map((_, i) => (
              <div key={i} style={{
                width: '28px', height: '28px',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 700,
                background: i < clueData.completedSteps
                  ? pathColorHex
                  : i === clueData.completedSteps
                  ? 'var(--accent-gold)'
                  : 'var(--bg-dark)',
                border: `2px solid ${i < clueData.completedSteps ? pathColorHex : i === clueData.completedSteps ? 'var(--accent-gold)' : 'var(--border)'}`,
                color: i <= clueData.completedSteps ? (i === clueData.totalSteps - 1 ? '#000' : 'white') : 'var(--text-muted)',
                transition: 'all 0.3s'
              }}>
                {i < clueData.completedSteps ? '✓' : i === clueData.totalSteps - 1 ? '🏁' : i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Current Clue Card */}
        <div className="card mb-2 fade-in" style={{
          border: `2px solid ${pathColorHex}`,
          background: `linear-gradient(135deg, var(--bg-card), ${pathColorHex}08)`,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative corner */}
          <div style={{
            position: 'absolute', top: 0, right: 0,
            width: '60px', height: '60px',
            background: pathColorHex + '22',
            borderBottomLeftRadius: '60px'
          }}></div>

          <div className="flex-between mb-1">
            <div>
              <span className="badge" style={{
                background: pathColorHex + '33',
                color: pathColorHex,
                border: `1px solid ${pathColorHex}55`,
                marginBottom: '0.5rem'
              }}>
                📍 {t('step')} {clueData.currentStep} {t('of')} {clueData.totalSteps}
              </span>
              {clueData.isDestination && (
                <span className="badge badge-success ml-1">🏁 Final!</span>
              )}
            </div>
          </div>

          <h2 style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: '1rem',
            color: 'var(--accent-gold)',
            marginBottom: '1rem'
          }}>
            🗺️ {t('currentClue')}
          </h2>

          {/* Telugu clue - PROMINENT */}
          <div className="card" style={{
            background: 'rgba(0,0,0,0.3)',
            border: `1px solid ${pathColorHex}33`,
            marginBottom: '0.8rem'
          }}>
            <p className="telugu-text" style={{
              fontSize: '1.2rem',
              lineHeight: '2',
              color: 'var(--text-primary)',
              textAlign: 'center',
              fontWeight: 500
            }}>
              {clueData.clue}
            </p>
          </div>

          {/* English clue (if available) */}
          {clueData.clueInEnglish && (
            <div className="card" style={{ background: 'rgba(255,255,255,0.03)', padding: '0.8rem' }}>
              <p className="text-sm text-secondary" style={{ textAlign: 'center', fontStyle: 'italic' }}>
                🇬🇧 {clueData.clueInEnglish}
              </p>
            </div>
          )}
        </div>

        {/* Validation Section */}
        <div className="card mb-2 fade-in">
          <h3 style={{ color: 'var(--accent-gold)', marginBottom: '1rem', fontSize: '0.95rem' }}>
            ✅ {language === 'te' ? 'స్థలం ధృవీకరించండి' : 'Validate Location'}
          </h3>
          <p className="text-sm text-secondary telugu-text mb-2">
            {language === 'te'
              ? 'సూచన చదివి స్థలానికి వెళ్ళి, అక్కడ ఉన్న QR కోడ్ స్కాన్ చేయండి లేదా కోడ్ నమోదు చేయండి.'
              : 'Follow the clue to the location, then scan the QR code placed there or enter the code manually.'}
          </p>

          {/* QR Scanner button */}
          {!showScanner && !showManual && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
                onClick={() => { setShowScanner(true); setLastResult(null); }}
                disabled={validating}
              >
                {validating ? '⏳ Validating...' : `📷 ${t('scanQR')}`}
              </button>
              <button
                className="btn btn-secondary"
                style={{ width: '100%' }}
                onClick={() => { setShowManual(true); setLastResult(null); }}
                disabled={validating}
              >
                ⌨️ {t('enterCode')}
              </button>
            </div>
          )}

          {/* QR Scanner */}
          {showScanner && (
            <div className="fade-in">
              <QRScanner
                onScan={handleScan}
                onClose={() => setShowScanner(false)}
              />
              <button className="btn btn-secondary mt-2" style={{ width: '100%' }}
                onClick={() => { setShowScanner(false); setShowManual(true); }}>
                ⌨️ {t('enterCode')}
              </button>
            </div>
          )}

          {/* Manual code entry */}
          {showManual && (
            <div className="fade-in">
              <form onSubmit={handleManualSubmit}>
                <div className="input-group">
                  <label className="telugu-text">
                    {language === 'te' ? 'QR లో ఉన్న కోడ్ నమోదు చేయండి' : 'Enter the code from the QR sheet'}
                  </label>
                  <input
                    type="text"
                    value={manualCode}
                    onChange={e => setManualCode(e.target.value)}
                    placeholder={language === 'te' ? 'కోడ్ ఇక్కడ నమోదు చేయండి' : 'Paste or type the validation code'}
                    autoFocus
                    style={{ fontFamily: 'monospace', fontSize: '0.9rem', letterSpacing: '0.05em' }}
                  />
                </div>
                <div className="flex gap-1">
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={validating}>
                    {validating ? '⏳...' : `✅ ${t('submit')}`}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowManual(false); setManualCode(''); }}>
                    {t('cancel')}
                  </button>
                </div>
              </form>

              <div style={{ textAlign: 'center', margin: '0.5rem 0', color: 'var(--text-muted)' }}>— or —</div>

              <button className="btn btn-secondary" style={{ width: '100%' }}
                onClick={() => { setShowManual(false); setShowScanner(true); }}>
                📷 {t('scanQR')}
              </button>
            </div>
          )}

          {/* Result feedback — only show when not validating and not in scanner/manual mode */}
          {lastResult && !validating && !showScanner && !showManual && (
            <div className="card mt-2 fade-in" style={{
              border: `1px solid ${lastResult.success ? 'var(--success)' : 'var(--error)'}`,
              background: lastResult.success ? 'rgba(76,175,80,0.1)' : 'rgba(244,67,54,0.1)'
            }}>
              <p className="telugu-text text-center" style={{ color: lastResult.success ? 'var(--success)' : 'var(--error)' }}>
                {lastResult.success ? '✅' : '❌'}{' '}
                {language === 'te'
                  ? (lastResult.success ? lastResult.messageInTelugu || lastResult.message : lastResult.errorInTelugu || lastResult.error)
                  : (lastResult.success ? lastResult.message : lastResult.error)}
              </p>
            </div>
          )}
        </div>

        {/* Progress history */}
        {clueData.progress && clueData.progress.length > 0 && (
          <div className="card fade-in">
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.8rem' }}>
              📋 {language === 'te' ? 'పూర్తిచేసిన స్థలాలు' : 'Completed Locations'}
            </h3>
            {clueData.progress.map((p, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.4rem 0',
                borderBottom: i < clueData.progress.length - 1 ? '1px solid var(--border)' : 'none'
              }}>
                <span style={{ color: 'var(--success)', fontSize: '1rem' }}>✓</span>
                <span className="text-sm" style={{ flex: 1 }}>{p.placeName}</span>
                <span className="text-sm text-muted">
                  {new Date(p.arrivedAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
