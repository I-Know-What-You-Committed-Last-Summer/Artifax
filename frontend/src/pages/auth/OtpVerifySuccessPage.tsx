import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

function OtpVerifySuccessPage() {
  const navigate = useNavigate();

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
            <p>Your OTP was accepted. You can continue to the login page.</p>
          </div>

          <div className="login-actions-column">
            <button type="button" className="login-submit" onClick={() => navigate('/login')}>
              Continue To Login
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default OtpVerifySuccessPage;