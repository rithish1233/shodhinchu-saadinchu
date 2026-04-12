import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const { user, logout, isHost, isTeam } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="nav">
      <Link to={user ? (isHost ? '/host' : '/game') : '/'} className="nav-logo" style={{textDecoration:'none'}}>
        ✦ {language === 'te' ? 'శోధించు సాధించు' : 'Shodhinchu Saadinchu'} ✦
      </Link>

      <div className="nav-actions">
        <button className="lang-toggle" onClick={toggleLanguage}>
          {language === 'te' ? 'English' : 'తెలుగు'}
        </button>

        {isHost && (
          <>
            <Link to="/host" className={`btn btn-secondary ${location.pathname === '/host' ? 'active' : ''}`} style={{padding:'0.4rem 0.8rem',fontSize:'0.85rem'}}>
              {t('hostDashboard').split(' ')[0]}
            </Link>
            <Link to="/host/paths" className="btn btn-secondary" style={{padding:'0.4rem 0.8rem',fontSize:'0.85rem'}}>
              {t('paths')}
            </Link>
            <Link to="/host/teams" className="btn btn-secondary" style={{padding:'0.4rem 0.8rem',fontSize:'0.85rem'}}>
              {t('teams')}
            </Link>
          </>
        )}

        {isTeam && (
          <span className="badge badge-info" style={{fontSize:'0.8rem'}}>
            {user?.teamName}
          </span>
        )}

        {user && (
          <button onClick={handleLogout} className="btn btn-danger" style={{padding:'0.4rem 0.8rem',fontSize:'0.85rem'}}>
            {t('logout')}
          </button>
        )}
      </div>
    </nav>
  );
}
