const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    companyName: '',
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        // Auto-login after successful registration
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user || data));
        navigate('/');
      } else {
        setError(data.error || 'REGISTRATION_REJECTED');
      }
    } catch (err) {
      setError('NETWORK_CRASH: Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-950 border border-emerald-500/30 rounded-3xl p-8 shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)]">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black uppercase tracking-tighter">New Node</h1>
          <p className="text-zinc-500 text-[10px] font-bold tracking-[0.2em] mt-2">REGISTRATION_INITIALIZED</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-3">
          <input
            type="text"
            placeholder="COMPANY NAME"
            className="w-full bg-black border-2 border-zinc-800 p-4 rounded-xl outline-none focus:border-emerald-500 text-sm"
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="EMAIL ADDRESS"
            className="w-full bg-black border-2 border-zinc-800 p-4 rounded-xl outline-none focus:border-emerald-500 text-sm"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="CREATE PASSWORD"
            className="w-full bg-black border-2 border-zinc-800 p-4 rounded-xl outline-none focus:border-emerald-500 text-sm"
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <input
            type="tel"
            placeholder="PHONE (OPTIONAL)"
            className="w-full bg-black border-2 border-zinc-800 p-4 rounded-xl outline-none focus:border-emerald-500 text-sm"
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          />

          {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 text-black font-black py-4 rounded-xl uppercase tracking-widest mt-4"
          >
            {loading ? 'INITIALIZING...' : 'ACTIVATE_ACCOUNT'}
          </button>
        </form>
      </div>
    </div>
  );
};
