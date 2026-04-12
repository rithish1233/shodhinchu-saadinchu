import React, { useEffect, useRef, useState } from 'react';

export default function QRScanner({ onScan, onClose }) {
  const scannerRef = useRef(null);
  const [error, setError] = useState('');
  const [started, setStarted] = useState(false);
  const instanceRef = useRef(null);
  const hasScannedRef = useRef(false); // ✅ prevent multiple scan callbacks
  const onScanRef = useRef(onScan);    // ✅ keep latest onScan without re-triggering effect

  // ✅ Keep the ref updated without causing effect to re-run
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    let isMounted = true;

    const stopScanner = async () => {
      if (instanceRef.current) {
        try {
          const state = instanceRef.current.getState();
          // Only stop if actively scanning (state 2 = SCANNING)
          if (state === 2) {
            await instanceRef.current.stop();
          }
          instanceRef.current.clear();
        } catch (e) {
          // ignore stop errors
        }
        instanceRef.current = null;
      }
    };

    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');

        if (!isMounted) return;

        const html5QrCode = new Html5Qrcode('qr-reader');
        instanceRef.current = html5QrCode;

        const cameras = await Html5Qrcode.getCameras();
        if (!cameras || cameras.length === 0) {
          if (isMounted) setError('No camera found on this device.');
          return;
        }

        if (!isMounted) return;

        // Prefer back camera
        const camera = cameras.find(c => c.label.toLowerCase().includes('back')) || cameras[0];

        await html5QrCode.start(
          camera.id,
          { fps: 5, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
          async (decodedText) => {
            // ✅ Only fire once — ignore subsequent frames with same code
            if (hasScannedRef.current) return;
            hasScannedRef.current = true;

            await stopScanner();

            // ✅ Use ref so we always call latest version of onScan
            onScanRef.current(decodedText.trim());
          },
          () => {} // ignore per-frame errors
        );

        if (isMounted) setStarted(true);
      } catch (err) {
        console.error('Scanner error:', err);
        if (isMounted) setError('Cannot access camera. Use manual code entry instead.');
      }
    };

    hasScannedRef.current = false;
    startScanner();

    return () => {
      isMounted = false;
      stopScanner();
    };
  }, []); // ✅ empty deps — scanner starts once, never restarts on re-render

  const handleClose = async () => {
    if (instanceRef.current) {
      try {
        const state = instanceRef.current.getState();
        if (state === 2) await instanceRef.current.stop();
        instanceRef.current.clear();
      } catch (e) {}
      instanceRef.current = null;
    }
    onClose();
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        background: 'var(--bg-dark)',
        border: '2px solid var(--accent-gold)',
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1rem'
      }}>
        {error ? (
          <div className="text-error telugu-text" style={{ padding: '2rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</div>
            {error}
          </div>
        ) : (
          <>
            <div id="qr-reader" ref={scannerRef} style={{ width: '100%', maxWidth: '300px', margin: '0 auto' }}></div>
            {!started && (
              <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                <div className="spinner" style={{ width: '24px', height: '24px', margin: '0 auto 0.5rem' }}></div>
                Starting camera...
              </div>
            )}
          </>
        )}
      </div>

      <p className="text-sm text-muted" style={{ marginBottom: '0.8rem' }}>
        📱 Point camera at the QR code at your current location
      </p>

      <button className="btn btn-secondary" onClick={handleClose} style={{ width: '100%' }}>
        ✕ Close Scanner
      </button>
    </div>
  );
}
