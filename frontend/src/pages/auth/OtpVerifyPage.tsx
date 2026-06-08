import { ClipboardEvent, FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import { getCurrentUserFromSession, verifyLoginOtp, LoginEmployeeResponse } from '../../services/authApi';
import { setCurrentUser } from '../../utils/currentUser';
import { QRCodeSVG } from 'qrcode.react';

const OTP_LENGTH = 6;
const PENDING_LOGIN_CHALLENGE_KEY = 'artifax.pendingLoginChallenge';

function OtpVerifyPage() {
  const navigate = useNavigate();
  const [digits, setDigits] = useState<string[]>(Array.from({ length: OTP_LENGTH }, () => ''));
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [challenge, setChallenge] = useState<LoginEmployeeResponse | null>(null);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const code = useMemo(() => digits.join(''), [digits]);
  const isCodeComplete = code.length === OTP_LENGTH;
  const isSetupMode = challenge?.requiresSetup === true;
  const roleLabel = challenge?.userLevel || 'Employee';

  useEffect(() => {
    const rawChallenge = window.sessionStorage.getItem(PENDING_LOGIN_CHALLENGE_KEY);
    if (!rawChallenge) {
      navigate('/login', { replace: true });
      return;
    }

    try {
      setChallenge(JSON.parse(rawChallenge) as LoginEmployeeResponse);
    } catch {
      window.sessionStorage.removeItem(PENDING_LOGIN_CHALLENGE_KEY);
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const focusInput = (index: number) => {
    const target = inputRefs.current[index];
    if (target) {
      target.focus();
      target.select();
    }
  };

  const updateDigit = (index: number, value: string) => {
    const numeric = value.replace(/\D/g, '').slice(-1);
    setDigits((previous) => {
      const next = [...previous];
      next[index] = numeric;
      return next;
    });

    if (numeric && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      focusInput(index - 1);
      return;
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      focusInput(index - 1);
      return;
    }

    if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      event.preventDefault();
      focusInput(index + 1);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) {
      return;
    }

    event.preventDefault();
    const next = Array.from({ length: OTP_LENGTH }, (_, index) => pasted[index] || '');
    setDigits(next);
    focusInput(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitAttempted(true);
    setSubmitError('');

    if (!isCodeComplete) {
      return;
    }

    setIsSubmitting(true);

    try {
      const verifyResponse = await verifyLoginOtp({ code });
      const sessionUser = await getCurrentUserFromSession();
      setCurrentUser({
        name: sessionUser.Username || challenge?.username || challenge?.userEmail || 'User',
        role: sessionUser.UserLevel || challenge?.userLevel || 'Employee',
        email: sessionUser.UserEmail || challenge?.userEmail,
      });
      window.sessionStorage.removeItem(PENDING_LOGIN_CHALLENGE_KEY);
      if (verifyResponse.recoveryCodes && verifyResponse.recoveryCodes.length > 0) {
        navigate('/login/verify-success', {
          replace: true,
          state: { recoveryCodes: verifyResponse.recoveryCodes },
        });
        return;
      }

      navigate('/dashboard', { replace: true });
    } catch (error) {
      const message = error instanceof Error && error.message
        ? error.message
        : 'The verification code was invalid.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page-shell">
      <section className="login-card login-card-compact">
        <header className="login-card-header">
          <div className="login-title-row">
            <div className="login-avatar" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="6" width="16" height="12" rx="2" />
                <path d="M8 10h8" />
                <path d="M8 14h4" />
              </svg>
            </div>
            <h1>Verification Code</h1>
          </div>
          <div className="login-context-row" role="status" aria-live="polite">
            <span className="login-role-badge">Role: {roleLabel}</span>
            <span className={`login-mode-badge ${isSetupMode ? 'setup' : 'verify'}`}>
              {isSetupMode ? 'First-time setup' : 'Standard verification'}
            </span>
          </div>
        </header>

        <div className="login-card-body login-card-body-compact">
          <p className="login-subtitle">
            {isSetupMode
              ? 'Set up your authenticator app with the key below, then enter the 6-digit code.'
              : 'Open your authenticator app and enter the current 6-digit code.'}
          </p>

          {isSetupMode ? (
            <div className="login-setup-panel" role="status" aria-live="polite">
              <strong>Complete these setup steps:</strong>
              <ol>
                <li>Open your authenticator app.</li>
                <li>Add a new account using the QR code or manual key.</li>
                <li>Enter the generated 6-digit code below.</li>
              </ol>
            </div>
          ) : null}

          {isSetupMode && challenge?.manualEntryKey ? (
            <div className="login-alert" role="status" aria-live="polite">
              <div>
                <strong>Manual setup key</strong>
                <p>{challenge.manualEntryKey}</p>
              </div>
            </div>
          ) : null}

          {isSetupMode && challenge?.otpAuthUri ? (
            <div className="login-qr-panel">
              <div className="login-qr-card">
                <QRCodeSVG value={challenge.otpAuthUri} size={180} includeMargin />
              </div>
              <p className="login-qr-caption">Scan this QR code with Google Authenticator, Microsoft Authenticator, or a compatible TOTP app.</p>
            </div>
          ) : null}

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="login-otp-sequence" role="group" aria-label="One-time password input">
              {digits.map((digit, index) => (
                <input
                  key={`otp-${index}`}
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  className={`login-otp-input ${(submitAttempted && !isCodeComplete) ? 'invalid' : ''}`}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? 'one-time-code' : 'off'}
                  maxLength={1}
                  value={digit}
                  onChange={(event) => updateDigit(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  onPaste={handlePaste}
                  aria-label={`Code digit ${index + 1}`}
                />
              ))}
            </div>

            {(submitAttempted && !isCodeComplete) ? (
              <p className="login-inline-error" role="alert">Enter the full 6-digit code.</p>
            ) : null}

            {submitError ? (
              <p className="login-inline-error" role="alert">{submitError}</p>
            ) : null}

            <button type="submit" className="login-submit" disabled={!isCodeComplete || isSubmitting}>
              {isSubmitting ? 'Verifying...' : 'Verify Account'}
            </button>

            <button
              type="button"
              className="login-secondary-action"
              onClick={() => {
                window.sessionStorage.removeItem(PENDING_LOGIN_CHALLENGE_KEY);
                navigate('/login');
              }}
            >
              Back To Login
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default OtpVerifyPage;