import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './LoginPage.css';

function OtpVerifySuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const recoveryCodes = useMemo(() => {
    const state = location.state as { recoveryCodes?: string[] } | null;
    return state?.recoveryCodes ?? [];
  }, [location.state]);

  return (
    <main className="login-page-shell">
      <section className="login-card login-card-compact">
        <div className="login-card-body login-card-body-compact">
          <div className="login-status-card success" role="status" aria-live="polite">
            <div className="login-status-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M8.2 12.3l2.4 2.4 5-5" />
              </svg>
            </div>
            <h1>Verification Successful</h1>
            <p>
              {recoveryCodes.length > 0
                ? 'Your authenticator setup is complete. Save these recovery codes before you continue.'
                : 'Your OTP was accepted. You can continue into the app.'}
            </p>
          </div>

          {recoveryCodes.length > 0 ? (
            <div className="login-recovery-panel">
              <strong>Recovery codes</strong>
              <p>Each code can be used once if you lose access to your authenticator app.</p>
              <div className="login-recovery-grid">
                {recoveryCodes.map((code) => (
                  <span key={code} className="login-recovery-code">{code}</span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="login-actions-column">
            <button type="button" className="login-submit" onClick={() => navigate('/dashboard', { replace: true })}>
              Continue To App
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default OtpVerifySuccessPage;