import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const rawUrl = import.meta.env.VITE_API_URL || "https://systems-j894.onrender.com";
const API_BASE_URL = rawUrl.replace(/\/$/, "");

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
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        navigate('/dashboard');
      } else {
        setError(data.error || 'LOGIN_FAILED');
      }
    } catch (err) {
      setError('NETWORK_ERROR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <form onSubmit={handleLogin} className="max-w-md w-full bg-zinc-950 p-8 rounded-2xl border border-emerald-500/30 space-y-4">

        <h1 className="text-2xl font-bold text-emerald-500 text-center">Login</h1>

        <input
          placeholder="Email"
          className="w-full p-3 bg-black border border-zinc-700 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 bg-black border border-zinc-700 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          disabled={loading}
          className="w-full bg-emerald-500 text-black font-bold p-3 rounded"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="text-center text-sm">
          No account?{' '}
          <span className="text-emerald-400 cursor-pointer" onClick={() => navigate('/register')}>
            Register
          </span>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
