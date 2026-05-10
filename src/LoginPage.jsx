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
      // Direct call to your Render Auth API
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.toLowerCase().trim(), // Sanitize input
          password 
        }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        // Essential: Save both token and user profile
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user || data)); 
        navigate('/');
      } else {
        setError(data.message || data.error || 'UNAUTHORIZED_ACCESS');
      }
    } catch (err) {
      setError('SYSTEM_OFFLINE: Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-950 border border-emerald-500/30 rounded-3xl p-8 shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)]">
        <div className="text-center mb-8">
          {/* LOGO ADDED HERE */}
          <img src="/logo.png" alt="SystemsWorks" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-black uppercase tracking-tighter text-emerald-500">SystemsWorks</h1>
          <p className="text-zinc-500 text-[10px] font-bold tracking-[0.2em] mt-2">SECURE_NODE_AUTH</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="EMAIL ADDRESS"
            className="w-full bg-black border-2 border-zinc-800 p-4 rounded-xl outline-none focus:border-emerald-500 text-sm font-mono"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="PASSWORD"
            className="w-full bg-black border-2 border-zinc-800 p-4 rounded-xl outline-none focus:border-emerald-500 text-sm font-mono"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-lg text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-xl uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'AUTHENTICATING...' : 'ESTABLISH_SESSION'}
          </button>
        </form>

        <p className="text-center text-zinc-600 text-xs mt-6">
          NO_ACCOUNT?{' '}
          {/* LINK TO REGISTER ADDED HERE */}
          <button onClick={() => navigate('/register')} className="text-emerald-500 hover:underline font-bold uppercase">Create Account</button>
        </p>
      </div>
    </div>
  );
};
