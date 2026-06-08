import { ClipboardEvent, FormEvent, KeyboardEvent, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const OTP_LENGTH = 6;
const DEMO_VALID_OTP = '123456';

function OtpVerifyPage() {
  const navigate = useNavigate();
  const [digits, setDigits] = useState<string[]>(Array.from({ length: OTP_LENGTH }, () => ''));
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const code = useMemo(() => digits.join(''), [digits]);
  const isCodeComplete = code.length === OTP_LENGTH;

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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitAttempted(true);

    if (!isCodeComplete) {
      return;
    }

    if (code === DEMO_VALID_OTP) {
      navigate('/login/verify-success');
      return;
    }

    navigate('/login/verify-failed');
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
        </header>

        <div className="login-card-body login-card-body-compact">
          <p className="login-subtitle">We sent a 6-digit code to your device.</p>

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

            <button type="submit" className="login-submit" disabled={!isCodeComplete}>
              Verify Account
            </button>

            <button
              type="button"
              className="login-secondary-action"
              onClick={() => navigate('/login')}
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