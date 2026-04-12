import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

export default function QRPrintPage() {
  const { pathId } = useParams();
  const { language } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQRs = async () => {
      try {
        const res = await axios.get(`/paths/${pathId}/qrcodes`);
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQRs();
  }, [pathId]);

  if (loading) return <div className="flex-center" style={{ height: '60vh' }}><div className="spinner"></div></div>;
  if (!data) return <div className="page"><p className="text-error">Failed to load QR codes</p></div>;

  const colorMap = {
    Red: '#e74c3c', Blue: '#3498db', Green: '#2ecc71', Yellow: '#f1c40f',
    Orange: '#e67e22', Purple: '#9b59b6', Pink: '#e91e8c', Brown: '#795548',
    Black: '#546e7a', White: '#ecf0f1', Gold: '#f39c12', Silver: '#95a5a6'
  };

  const pathColor = colorMap[data.pathColor] || '#d4a843';

  return (
    <div className="page fade-in">
      <div className="no-print page-header flex-between">
        <div>
          <h1 className="page-title">🖨️ QR Codes — {data.pathColor} Path #{data.pathNumber}</h1>
          <p className="text-sm text-muted">
            {language === 'te'
              ? 'ప్రతి స్థలంలో సంబంధిత QR కోడ్ అతికించండి'
              : 'Print and place each QR code at its corresponding location'}
          </p>
        </div>
        <div className="flex gap-1">
          <Link to="/host/paths" className="btn btn-secondary">← Back</Link>
          <button className="btn btn-primary" onClick={() => window.print()}>🖨️ Print All</button>
        </div>
      </div>

      {/* Instructions */}
      <div className="card mb-3 no-print" style={{ background: 'rgba(26,188,156,0.08)', border: '1px solid rgba(26,188,156,0.3)' }}>
        <h3 style={{ color: '#1abc9c', marginBottom: '0.5rem' }}>
          📋 {language === 'te' ? 'సూచనలు' : 'Instructions'}
        </h3>
        <ol style={{ paddingLeft: '1.2rem', lineHeight: '2' }}>
          <li className="text-secondary telugu-text">
            {language === 'te'
              ? 'ప్రతి QR కోడ్‌ను దాని స్థలంలో అతికించండి (Place 1 → 1వ స్థలంలో, Place 2 → 2వ స్థలంలో)'
              : 'Place each QR at its corresponding location (QR for Place 1 at location 1, etc.)'}
          </li>
          <li className="text-secondary telugu-text">
            {language === 'te'
              ? 'జట్టు 1వ సూచన చూసి 1వ స్థలానికి వస్తుంది → అక్కడ QR స్కాన్ చేస్తుంది → 2వ సూచన పొందుతుంది'
              : 'Teams read clue → go to location → scan QR → unlock next clue'}
          </li>
          <li className="text-secondary telugu-text">
            {language === 'te'
              ? 'ఆఖరి స్థలం (5వ) గమ్యస్థానం — అక్కడ QR స్కాన్ చేసిన తర్వాత ఆట పూర్తవుతుంది'
              : 'Final location (Place 5) is the destination — scanning completes the game'}
          </li>
        </ol>
      </div>

      {/* QR Cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {data.places.map((place) => (
          <div key={place.placeNumber} className="qr-print-page" style={{
            background: 'white',
            border: `3px solid ${place.isDestination ? '#f39c12' : pathColor}`,
            borderRadius: '16px',
            padding: '1.5rem',
            textAlign: 'center',
            color: '#1a1a2e',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Header banner */}
            <div style={{
              background: place.isDestination ? '#f39c12' : pathColor,
              margin: '-1.5rem -1.5rem 1rem -1.5rem',
              padding: '0.8rem',
              color: 'white'
            }}>
              <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '0.9rem', fontWeight: 700 }}>
                ✦ శోధించు సాధించు ✦
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.9, marginTop: '0.2rem' }}>
                {data.pathColor} Path #{data.pathNumber}
              </div>
            </div>

            {/* Place badge */}
            <div style={{
              background: place.isDestination ? '#fff3cd' : '#f0f0ff',
              border: `2px solid ${place.isDestination ? '#f39c12' : pathColor}`,
              borderRadius: '8px',
              padding: '0.4rem 1rem',
              display: 'inline-block',
              marginBottom: '1rem',
              fontSize: '0.9rem',
              fontWeight: 700,
              color: place.isDestination ? '#856404' : '#1a1a2e'
            }}>
              {place.isDestination ? '🏁 DESTINATION' : `📍 Place ${place.placeNumber} of 5`}
            </div>

            {/* QR Code */}
            {place.qrCodeDataUrl ? (
              <div style={{
                background: 'white',
                padding: '12px',
                borderRadius: '8px',
                display: 'inline-block',
                border: `2px solid ${pathColor}22`,
                marginBottom: '1rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <img src={place.qrCodeDataUrl} alt={`QR for ${place.placeName}`}
                  style={{ width: '200px', height: '200px', display: 'block' }} />
              </div>
            ) : (
              <div style={{ width: '200px', height: '200px', background: '#f0f0f0', margin: '0 auto 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                No QR
              </div>
            )}

            {/* Validation code (backup) */}
            <div style={{
              background: '#f8f9fa',
              border: '1px dashed #ccc',
              borderRadius: '8px',
              padding: '0.6rem',
              marginBottom: '0.5rem'
            }}>
              <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '0.3rem' }}>
                📱 {language === 'te' ? 'స్కాన్ చేయలేకపోతే ఈ కోడ్ వాడండి' : 'Manual code (if QR scan fails):'}
              </div>
              <div style={{
                fontFamily: 'monospace',
                fontSize: '0.65rem',
                color: '#333',
                wordBreak: 'break-all',
                letterSpacing: '0.05em',
                background: 'white',
                padding: '0.3rem',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}>
                {place.validationCode}
              </div>
            </div>

            {/* Place name */}
            <div style={{ fontSize: '0.75rem', color: '#666', fontStyle: 'italic' }}>
              Location: {place.placeName}
            </div>

            {/* Decorative corner */}
            <div style={{
              position: 'absolute', bottom: '0.5rem', right: '0.8rem',
              fontSize: '0.65rem', color: '#ccc'
            }}>✦</div>
          </div>
        ))}
      </div>

      {/* Print flow diagram */}
      <div className="card mt-3 no-print">
        <h3 className="text-gold mb-2">
          🔄 {language === 'te' ? 'ఆట ప్రవాహం' : 'Game Flow'}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {data.places.map((place, i) => (
            <React.Fragment key={i}>
              <div className="card" style={{
                padding: '0.6rem 1rem',
                borderColor: place.isDestination ? 'var(--accent-gold)' : pathColor + '44',
                textAlign: 'center', minWidth: '100px'
              }}>
                <div style={{ fontSize: '1rem' }}>{place.isDestination ? '🏁' : '📍'}</div>
                <div className="text-sm font-bold">{place.placeName}</div>
                <div className="text-sm text-muted">Place {place.placeNumber}</div>
              </div>
              {i < data.places.length - 1 && (
                <div style={{ color: 'var(--accent-gold)', fontSize: '1.2rem' }}>→</div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
