import { useState } from 'react';
import { UserPlus } from 'lucide-react';

import './Auth.css';

function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      setSuccess('');
      return;
    }

    if (password.length < 6) {
      setError(
        'Password must be at least 6 characters.'
      );
      setSuccess('');
      return;
    }

    try {
      const existingUser = JSON.parse(
        localStorage.getItem('hianimeUser')
      );

      if (existingUser?.email === email) {
        setError(
          'An account with this email already exists.'
        );
        setSuccess('');
        return;
      }
    } catch {
      // Ignore malformed local storage values.
    }

    const code = `${Math.floor(100000 + Math.random() * 900000)}`;

    localStorage.setItem(
      'hianimeEmailVerification',
      JSON.stringify({
        email,
        code,
        createdAt: Date.now(),
      })
    );

    setGeneratedCode(code);
    setVerificationSent(true);
    setVerificationCode('');
    setError('');
    setSuccess(
      `A confirmation code was sent to ${email}. Enter the code below to verify your account.`
    );
  };

  const handleVerification = (event) => {
    event.preventDefault();

    const storedVerification = JSON.parse(
      localStorage.getItem('hianimeEmailVerification')
    );

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!storedVerification || storedVerification.email !== email) {
      setError('Please create an account first.');
      setSuccess('');
      return;
    }

    if (String(verificationCode).trim() !== storedVerification.code) {
      setError('The confirmation code is incorrect.');
      setSuccess('');
      return;
    }

    const user = {
      name,
      email,
      password,
      avatar:
        'https://i.pravatar.cc/300?img=12',
      emailVerified: true,
      verifiedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      'hianimeUser',
      JSON.stringify(user)
    );

    localStorage.setItem(
      'hianimeLoggedIn',
      'true'
    );

    localStorage.removeItem(
      'hianimeEmailVerification'
    );

    setVerificationSent(false);
    setGeneratedCode('');
    setSuccess('Email verified successfully. Redirecting to your profile...');
    window.location.href = '/profile';
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-icon">
          <UserPlus size={28} />
        </div>

        <h1>Create Account</h1>

        <p className="auth-subtitle">
          Create your HiAnime account
        </p>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {success && (
          <div className="auth-success">
            {success}
          </div>
        )}

        {!verificationSent ? (
          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            <label htmlFor="register-name">
              Name
            </label>

            <input
              id="register-name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your name"
              autoComplete="name"
            />

            <label htmlFor="register-email">
              Email
            </label>

            <input
              id="register-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
            />

            <label htmlFor="register-password">
              Password
            </label>

            <input
              id="register-password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              autoComplete="new-password"
            />

            <button
              type="submit"
              className="auth-submit"
            >
              Create Account
            </button>
          </form>
        ) : (
          <form
            className="auth-form"
            onSubmit={handleVerification}
          >
            <div className="verification-code-box">
              <span>Demo verification code</span>
              <strong>{generatedCode}</strong>
            </div>

            <label htmlFor="register-verification-code">
              Enter verification code
            </label>

            <input
              id="register-verification-code"
              name="verificationCode"
              type="text"
              inputMode="numeric"
              value={verificationCode}
              onChange={(event) =>
                setVerificationCode(
                  event.target.value
                )
              }
              placeholder="Enter the 6-digit code"
            />

            <button
              type="submit"
              className="auth-submit"
            >
              Verify Email
            </button>
          </form>
        )}

        <p className="auth-footer">
          Already have an account?{' '}
          <a href="/login">Login</a>
        </p>
      </div>
    </main>
  );
}

export default Register;