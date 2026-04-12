import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

const PATH_COLORS = [
  { value: 'Red', te: 'ఎరుపు', hex: '#e74c3c' },
  { value: 'Blue', te: 'నీలం', hex: '#3498db' },
  { value: 'Green', te: 'ఆకుపచ్చ', hex: '#2ecc71' },
  { value: 'Yellow', te: 'పసుపు', hex: '#f1c40f' },
  { value: 'Orange', te: 'నారింజ', hex: '#e67e22' },
  { value: 'Purple', te: 'ఊదా', hex: '#9b59b6' },
  { value: 'Pink', te: 'గులాబీ', hex: '#e91e8c' },
  { value: 'Brown', te: 'గోధుమ', hex: '#795548' },
  { value: 'Black', te: 'నలుపు', hex: '#546e7a' },
  { value: 'White', te: 'తెలుపు', hex: '#ecf0f1' },
  { value: 'Gold', te: 'బంగారు', hex: '#f39c12' },
  { value: 'Silver', te: 'వెండి', hex: '#95a5a6' }
];

const emptyPlace = () => ({ placeName: '', clue: '', clueInEnglish: '' });

export default function PathManager() {
  const { t, language } = useLanguage();
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPath, setEditingPath] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    pathNumber: '',
    pathColor: '',
    pathColorInTelugu: '',
    pathName: '',
    places: [emptyPlace(), emptyPlace(), emptyPlace(), emptyPlace(), emptyPlace()]
  });

  const fetchPaths = useCallback(async () => {
    try {
      const res = await axios.get('/paths');
      setPaths(res.data);
    } catch (err) {
      toast.error('Failed to load paths');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPaths(); }, [fetchPaths]);

  const handleColorChange = (colorValue) => {
    const colorObj = PATH_COLORS.find(c => c.value === colorValue);
    setForm(f => ({
      ...f,
      pathColor: colorValue,
      pathColorInTelugu: colorObj?.te || ''
    }));
  };

  const handlePlaceChange = (index, field, value) => {
    const places = [...form.places];
    places[index] = { ...places[index], [field]: value };
    setForm(f => ({ ...f, places }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.pathNumber || !form.pathColor) return toast.error('Path number and color required');
    const validPlaces = form.places.filter(p => p.placeName && p.clue);
    if (validPlaces.length < 5) {
      return toast.error(language === 'te'
        ? 'అన్ని 5 స్థలాల వివరాలు పూర్తి చేయండి'
        : 'Please fill all 5 places with name and clue');
    }

    setSaving(true);
    try {
      if (editingPath) {
        // Update places
        await axios.put(`/paths/${editingPath._id}/places`, { places: form.places });
        // Update meta
        await axios.put(`/paths/${editingPath._id}`, {
          pathColor: form.pathColor,
          pathColorInTelugu: form.pathColorInTelugu,
          pathName: form.pathName
        });
        toast.success(language === 'te' ? 'మార్గం అప్‌డేట్ చేయబడింది!' : 'Path updated!');
      } else {
        await axios.post('/paths', form);
        toast.success(language === 'te' ? 'మార్గం సృష్టించబడింది! QR కోడ్‌లు తయారయ్యాయి.' : 'Path created! QR codes generated.');
      }
      setShowForm(false);
      setEditingPath(null);
      setForm({ pathNumber: '', pathColor: '', pathColorInTelugu: '', pathName: '', places: [emptyPlace(), emptyPlace(), emptyPlace(), emptyPlace(), emptyPlace()] });
      fetchPaths();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save path');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (path) => {
    setEditingPath(path);
    const places = Array(5).fill(null).map((_, i) => {
      const p = path.places[i];
      return p ? { placeName: p.placeName, clue: p.clue, clueInEnglish: p.clueInEnglish || '' } : emptyPlace();
    });
    setForm({
      pathNumber: path.pathNumber,
      pathColor: path.pathColor,
      pathColorInTelugu: path.pathColorInTelugu || '',
      pathName: path.pathName || '',
      places
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (pathId, pathColor) => {
    if (!window.confirm(`Delete ${pathColor} path?`)) return;
    try {
      await axios.delete(`/paths/${pathId}`);
      toast.success('Path deleted');
      fetchPaths();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const colorMap = Object.fromEntries(PATH_COLORS.map(c => [c.value, c.hex]));

  const placeLabels = language === 'te'
    ? ['1వ స్థలం (ప్రారంభం)', '2వ స్థలం', '3వ స్థలం', '4వ స్థలం', '5వ స్థలం (గమ్యం)']
    : ['Place 1 (Start)', 'Place 2', 'Place 3', 'Place 4', 'Place 5 (Destination)'];

  return (
    <div className="page fade-in">
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">🗺️ {t('paths')}</h1>
          <p className="text-sm text-muted telugu-text">
            {language === 'te' ? 'నిధి వేట మార్గాలు నిర్వహించండి' : 'Manage treasure hunt paths'}
          </p>
        </div>
        <div className="flex gap-1">
          <Link to="/host" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>← Dashboard</Link>
          {paths.length < 12 && !showForm && (
            <button className="btn btn-primary" onClick={() => { setEditingPath(null); setForm({ pathNumber: '', pathColor: '', pathColorInTelugu: '', pathName: '', places: [emptyPlace(), emptyPlace(), emptyPlace(), emptyPlace(), emptyPlace()] }); setShowForm(true); }}>
              + {t('createPath')}
            </button>
          )}
        </div>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="card mb-3" style={{ border: '1px solid var(--accent-gold)' }}>
          <h2 className="modal-title">
            {editingPath
              ? (language === 'te' ? 'మార్గం మార్చు' : 'Edit Path')
              : (language === 'te' ? 'కొత్త మార్గం సృష్టించు' : 'Create New Path')}
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Path Meta */}
            <div className="grid-2 mb-2">
              <div className="input-group">
                <label>{t('pathNumber')} (1-12)</label>
                <input type="number" min="1" max="12" value={form.pathNumber}
                  onChange={e => setForm(f => ({ ...f, pathNumber: parseInt(e.target.value) || '' }))}
                  disabled={!!editingPath}
                  placeholder="1-12" />
              </div>
              <div className="input-group">
                <label>{t('colorName')}</label>
                <select value={form.pathColor} onChange={e => handleColorChange(e.target.value)} disabled={!!editingPath}>
                  <option value="">{language === 'te' ? 'రంగు ఎంచుకోండి' : 'Select color'}</option>
                  {PATH_COLORS.map(c => (
                    <option key={c.value} value={c.value}>
                      {language === 'te' ? `${c.te} (${c.value})` : c.value}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="input-group mb-2">
              <label>{t('pathName')} ({language === 'te' ? 'ఐచ్ఛికం' : 'optional'})</label>
              <input type="text" value={form.pathName}
                onChange={e => setForm(f => ({ ...f, pathName: e.target.value }))}
                placeholder={language === 'te' ? 'మార్గానికి పేరు ఇవ్వండి' : 'Give this path a name'} />
            </div>

            <hr className="divider" />

            {/* Places */}
            <h3 className="text-gold telugu-text mb-2" style={{ fontSize: '1rem' }}>
              📍 {language === 'te' ? 'స్థలాలు మరియు సూచనలు' : 'Places & Clues'}
            </h3>

            {form.places.map((place, i) => (
              <div key={i} className="card mb-2" style={{
                borderColor: i === 4 ? 'var(--accent-gold)' : 'var(--border)',
                background: i === 4 ? 'rgba(212,168,67,0.05)' : 'rgba(255,255,255,0.02)'
              }}>
                <div className="flex-between mb-1">
                  <span style={{ fontWeight: 700, color: i === 4 ? 'var(--accent-gold)' : 'var(--text-secondary)' }}>
                    {i === 0 ? '🚦' : i === 4 ? '🏁' : `${i + 1}.`} {placeLabels[i]}
                  </span>
                  {i === 4 && <span className="badge badge-success">🏁 {t('destination')}</span>}
                </div>

                <div className="grid-2">
                  <div className="input-group">
                    <label>{t('placeName')}</label>
                    <input type="text" value={place.placeName}
                      onChange={e => handlePlaceChange(i, 'placeName', e.target.value)}
                      placeholder={language === 'te' ? 'స్థలం పేరు (నిర్వాహకుడికి మాత్రమే)' : 'Place name (host only)'} />
                  </div>
                  <div className="input-group">
                    <label>{t('clue')} (తెలుగు)</label>
                    <textarea value={place.clue}
                      onChange={e => handlePlaceChange(i, 'clue', e.target.value)}
                      placeholder={language === 'te' ? 'జట్టు చూసే తెలుగు సూచన' : 'Telugu clue teams will see'}
                      rows={2} style={{ minHeight: '60px' }} />
                  </div>
                </div>

                <div className="input-group">
                  <label>{t('clueInEnglish')} ({language === 'te' ? 'ఐచ్ఛికం' : 'optional'})</label>
                  <input type="text" value={place.clueInEnglish}
                    onChange={e => handlePlaceChange(i, 'clueInEnglish', e.target.value)}
                    placeholder={language === 'te' ? 'ఆంగ్ల సూచన (ఐచ్ఛికం)' : 'English clue (optional)'} />
                </div>

                <div className="card mt-1" style={{ background: 'rgba(26,188,156,0.08)', border: '1px solid rgba(26,188,156,0.2)', padding: '0.6rem' }}>
                  <p className="text-sm" style={{ color: '#1abc9c' }}>
                    💡 {language === 'te'
                      ? `ఈ స్థలంలో QR కోడ్ అతికించండి. జట్టు ఈ సూచన చూసి ఇక్కడికి వస్తుంది, తర్వాత QR స్కాన్ చేస్తుంది.`
                      : `Place the QR code at this location. Teams will read the clue and come here, then scan the QR.`}
                  </p>
                </div>
              </div>
            ))}

            <div className="flex gap-1 mt-2">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? '...' : (editingPath ? `💾 ${t('save')}` : `🗺️ ${t('createPath')} + ${t('generateQR')}`)}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditingPath(null); }}>
                {t('cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Paths list */}
      {loading ? (
        <div className="flex-center"><div className="spinner"></div></div>
      ) : paths.length === 0 ? (
        <div className="card text-center text-muted telugu-text" style={{ padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
          <div>{t('noPathsYet')}</div>
          <div className="text-sm mt-1">{language === 'te' ? '"కొత్త మార్గం సృష్టించు" నొక్కండి' : 'Click "Create Path" to get started'}</div>
        </div>
      ) : (
        <div className="grid-2">
          {paths.map(path => (
            <div key={path._id} className="card" style={{ borderColor: (colorMap[path.pathColor] || '#666') + '55' }}>
              <div className="flex-between mb-2">
                <div>
                  <span style={{ color: colorMap[path.pathColor] || '#fff', fontSize: '1.1rem', fontWeight: 700 }}>
                    ● {path.pathColor}
                  </span>
                  <span className="text-muted text-sm ml-1"> — #{path.pathNumber}</span>
                </div>
                <div className="flex gap-1">
                  <button className="btn btn-secondary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }} onClick={() => handleEdit(path)}>✏️</button>
                  <Link to={`/host/qr/${path._id}`} className="btn btn-success" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}>🖨️ QR</Link>
                  <button className="btn btn-danger" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }} onClick={() => handleDelete(path._id, path.pathColor)}>🗑️</button>
                </div>
              </div>

              {path.pathName && <div className="text-secondary text-sm mb-1">{path.pathName}</div>}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {path.places.map((place, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.4rem 0.6rem',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '6px',
                    borderLeft: `3px solid ${i === 4 ? 'var(--accent-gold)' : (colorMap[path.pathColor] || '#666')}44`
                  }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', minWidth: '20px' }}>
                      {i === 0 ? '🚦' : i === 4 ? '🏁' : `${i + 1}.`}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div className="text-sm font-bold">{place.placeName}</div>
                      <div className="text-sm text-muted telugu-text" style={{ fontSize: '0.78rem' }}>
                        {place.clue?.slice(0, 50)}{place.clue?.length > 50 ? '...' : ''}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#1abc9c', background: 'rgba(26,188,156,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                      QR ✓
                    </span>
                  </div>
                ))}
              </div>

              {path.places.length < 5 && (
                <div className="badge badge-warning mt-1">
                  {path.places.length}/5 {language === 'te' ? 'స్థలాలు పూర్తయ్యాయి' : 'places complete'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
