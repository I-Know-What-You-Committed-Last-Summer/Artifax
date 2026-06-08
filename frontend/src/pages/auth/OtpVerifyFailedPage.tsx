import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

function OtpVerifyFailedPage() {
  const navigate = useNavigate();

  return (
    <main className="login-page-shell">
      <section className="login-card login-card-compact">
        <div className="login-card-body login-card-body-compact">
          <div className="login-status-card failed" role="alert">
            <div className="login-status-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M9.5 9.5l5 5" />
                <path d="M14.5 9.5l-5 5" />
              </svg>
            </div>
            <h1>Verification Failed</h1>
            <p>The code entered did not match. Try again with the latest OTP.</p>
          </div>

          <div className="login-actions-column">
            <button type="button" className="login-submit" onClick={() => navigate('/login/verify')}>
              Try Again
            </button>
            <button type="button" className="login-secondary-action" onClick={() => navigate('/login')}>
              Back To Login
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default OtpVerifyFailedPage;