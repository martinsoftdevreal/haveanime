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
      return;
    }

    if (password.length < 6) {
      setError(
        'Password must be at least 6 characters.'
      );
      return;
    }

    const existingUser = JSON.parse(
      localStorage.getItem('hianimeUser')
    );

    if (existingUser?.email === email) {
      setError(
        'An account with this email already exists.'
      );
      return;
    }

    const user = {
      name,
      email,
      password,
      avatar:
        'https://i.pravatar.cc/300?img=12',
    };

    localStorage.setItem(
      'hianimeUser',
      JSON.stringify(user)
    );

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

        <p className="auth-footer">
          Already have an account?{' '}
          <a href="/login">Login</a>
        </p>
      </div>
    </main>
  );
}

export default Register;