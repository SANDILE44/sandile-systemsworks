import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// CLEAN URL LOGIC: Ensures no trailing slashes break the POST request online
const rawUrl = import.meta.env.VITE_API_URL || "https://systems-j894.onrender.com";
const API_BASE_URL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;

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

    // Construct precise endpoint
    const endpoint = `${API_BASE_URL}/api/auth/login`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        // Store session data for SystemsWorks dashboard
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user || data));
        navigate('/dashboard');
      } else {
        // Handle specific server errors
        setError(data.message || data.error || 'UNAUTHORIZED_ACCESS');
      }
    } catch (err) {
      // Handle network or CORS handshake failures
      setError('SYSTEM_OFFLINE: Connection to Node failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-950 border border-emerald-500/30 rounded-3xl p-8 shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)]">
        
        <div className="text-center mb-8">
          <img src="/logo.png" alt="SystemsWorks" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-black uppercase tracking-tighter text-emerald-500">SystemsWorks</h1>
          <p className="text-zinc-500 text-[10px] font-bold tracking-[0.2em] mt-2">SECURE_NODE_AUTH</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-zinc-500 ml-2 uppercase">Identity_Node</label>
            <input
              type="email"
              placeholder="EMAIL ADDRESS"
              className="w-full bg-black border-2 border-zinc-800 p-4 rounded-xl outline-none focus:border-emerald-500 text-sm font-mono transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-zinc-500 ml-2 uppercase">Access_Key</label>
            <input
              type="password"
              placeholder="PASSWORD"
              className="w-full bg-black border-2 border-zinc-800 p-4 rounded-xl outline-none focus:border-emerald-500 text-sm font-mono transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-lg text-red-500 text-[10px] font-black uppercase tracking-widest text-center animate-pulse">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-xl uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-emerald-500/20"
          >
            {loading ? 'AUTHENTICATING...' : 'ESTABLISH_SESSION'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-900">
          <p className="text-center text-zinc-600 text-[10px] font-bold tracking-wider uppercase">
            NO_ACCOUNT_DETECTED?{' '}
            <button 
              type="button" 
              onClick={() => navigate('/register')} 
              className="text-emerald-500 hover:text-white transition-colors underline-offset-4"
            >
              Initialize_Registration
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
