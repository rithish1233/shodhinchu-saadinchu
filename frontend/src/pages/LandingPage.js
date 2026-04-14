import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function LandingPage() {
  const { user, isHost, isTeam } = useAuth();
  const { language } = useLanguage();

  if (user) {
    if (isHost) return <Navigate to="/host" replace />;
    if (isTeam) return <Navigate to="/game" replace />;
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 60px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background elements */}
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none'
      }}>
        {['♦','✦','◆','❖','✧'].map((sym, i) => (
          <span key={i} style={{
            position: 'absolute',
            fontSize: `${1 + i * 0.5}rem`,
            color: 'rgba(212,168,67,0.08)',
            top: `${10 + i * 18}%`,
            left: `${5 + i * 20}%`,
            animation: `pulse ${2 + i}s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`
          }}>{sym}</span>
        ))}
        {['♦','✦','◆','❖','✧'].map((sym, i) => (
          <span key={`r${i}`} style={{
            position: 'absolute',
            fontSize: `${1 + i * 0.5}rem`,
            color: 'rgba(212,168,67,0.08)',
            top: `${15 + i * 15}%`,
            right: `${5 + i * 18}%`,
            animation: `pulse ${2.5 + i}s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`
          }}>{sym}</span>
        ))}
      </div>

      {/* Main content */}
      <div className="fade-in" style={{ maxWidth: '600px', zIndex: 1 }}>
        <div style={{
          fontSize: '4rem',
          marginBottom: '1rem',
          filter: 'drop-shadow(0 0 20px rgba(212,168,67,0.5))'
        }}>🗺️</div>

        <h1 style={{
          fontFamily: "'Cinzel Decorative', serif",
          fontSize: 'clamp(1.5rem, 5vw, 2.8rem)',
          color: 'var(--accent-gold)',
          textShadow: '0 0 30px rgba(212,168,67,0.5)',
          marginBottom: '0.5rem',
          lineHeight: 1.2
        }}>
          {language === 'te' ? 'శోధించు సాధించు' : 'Shodhinchu Saadinchu'}
        </h1>

        <p className="telugu-text" style={{
          fontSize: '1.1rem',
          color: 'var(--text-secondary)',
          marginBottom: '0.5rem'
        }}>
          {language === 'te' ? 'నిధి వేట ఆట' : 'Treasure Hunt Game'}
        </p>

        <p style={{
          color: 'var(--text-muted)',
          fontSize: '0.9rem',
          marginBottom: '3rem'
        }}>
          {language === 'te'
            ? 'సూచనలను అనుసరించి, స్థలాలను కనుగొని, గమ్యస్థానానికి చేరుకోండి!'
            : 'Follow the clues, find the locations, and reach your destination!'}
        </p>

        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/host-login" className="btn btn-secondary" style={{
            padding: '1rem 2rem',
            fontSize: '1rem',
            border: '2px solid var(--accent-gold)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <span style={{ fontSize: '1.2rem' }}>👑</span>
            <span className="telugu-text">
              {language === 'te' ? 'నిర్వాహకుడు' : 'Host Login'}
            </span>
          </Link>

          <Link to="/team-login" className="btn btn-primary" style={{
            padding: '1rem 2rem',
            fontSize: '1rem'
          }}>
            <span style={{ fontSize: '1.2rem' }}>🏃</span>
            <span className="telugu-text">
              {language === 'te' ? 'జట్టు లాగిన్' : 'Team Login'}
            </span>
          </Link>
        </div>

        {/* Feature highlights */}
        <div style={{
          marginTop: '3rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem'
        }}>
          {[
            { icon: '🗺️', te: '12 మార్గాలు', en: '12 Paths' },
            { icon: '📍', te: '5 స్థలాలు', en: '5 Locations' },
            { icon: '🏆', te: 'లీడర్‌బోర్డ్', en: 'Leaderboard' }
          ].map((f, i) => (
            <div key={i} className="card" style={{ padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{f.icon}</div>
              <div className="telugu-text text-sm text-secondary">{language === 'te' ? f.te : f.en}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
