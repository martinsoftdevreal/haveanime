import { useState } from 'react';
import { LogIn } from 'lucide-react';

import './Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    const user = JSON.parse(
      localStorage.getItem('hianimeUser')
    );

    if (!user) {
      setError(
        'No account found. Please create an account first.'
      );
      return;
    }

    if (
      user.email !== email.trim().toLowerCase() ||
      user.password !== password
    ) {
      setError(
        'Invalid email or password.'
      );
      return;
    }

    localStorage.setItem(
      'hianimeLoggedIn',
      'true'
    );

    window.location.href = '/profile';
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-icon">
          <LogIn size={28} />
        </div>

        <h1>Welcome Back</h1>

        <p className="auth-subtitle">
          Login to your HiAnime account
        </p>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <label htmlFor="login-email">
            Email
          </label>

          <input
            id="login-email"
            name="email"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="Enter your email"
            autoComplete="email"
          />

          <label htmlFor="login-password">
            Password
          </label>

          <input
            id="login-password"
            name="password"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Enter your password"
            autoComplete="current-password"
          />

          <button
            type="submit"
            className="auth-submit"
          >
            Login
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{' '}
          <a href="/register">Create Account</a>
        </p>
      </div>
    </main>
  );
}

export default Login;