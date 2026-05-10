import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE =
  (import.meta.env.VITE_API_URL || 'https://systems-j894.onrender.com').replace(/\/$/, '');

const LOGIN_URL = `${API_BASE}/api/auth/login`;

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || data.message || 'LOGIN_FAILED');
        return;
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        navigate('/dashboard');
      } else {
        setError('INVALID_SERVER_RESPONSE');
      }
    } catch (err) {
      setError('NETWORK_ERROR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-950 border border-emerald-500/30 rounded-3xl p-8">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-emerald-500">SystemsWorks</h1>
          <p className="text-zinc-500 text-xs mt-2">LOGIN</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">

          <input
            type="email"
            placeholder="EMAIL"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black border border-zinc-800 p-4 rounded-xl"
            required
          />

          <input
            type="password"
            placeholder="PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black border border-zinc-800 p-4 rounded-xl"
            required
          />

          {error && (
            <div className="text-red-500 text-xs font-bold text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 text-black font-black py-4 rounded-xl"
          >
            {loading ? 'LOADING...' : 'LOGIN'}
          </button>
        </form>

        <button
          onClick={() => navigate('/register')}
          className="w-full mt-6 text-emerald-500 text-sm"
        >
          Create account
        </button>

      </div>
    </div>
  );
};

export default LoginPage;
