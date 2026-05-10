import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_BASE_URL = "https://systems-j894.onrender.com";

// --- UTILITY: API CALL WITH AUTH ---
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/#/login';
  }

  return response;
};

// --- VIEW: LOGIN PAGE ---
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
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        navigate('/');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-950 border border-emerald-500/30 rounded-3xl p-8 shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)]">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="SSW Logo" className="w-16 h-16 object-contain mx-auto mb-4" />
          <h1 className="text-2xl font-black uppercase tracking-tighter">Sandile SystemsWorks</h1>
          <p className="text-zinc-500 text-[10px] font-bold tracking-[0.2em] mt-2">SECURE_NODE_AUTH</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="EMAIL ADDRESS"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black border-2 border-zinc-800 p-4 rounded-xl outline-none focus:border-emerald-500 text-sm"
            required
          />
          <input
            type="password"
            placeholder="PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black border-2 border-zinc-800 p-4 rounded-xl outline-none focus:border-emerald-500 text-sm"
            required
          />

          {error && <p className="text-red-500 text-xs font-bold">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3 rounded-xl uppercase tracking-widest transition-all active:scale-95"
          >
            {loading ? 'AUTHENTICATING...' : 'LOGIN'}
          </button>
        </form>

        <p className="text-center text-zinc-600 text-sm mt-6">
          Don't have an account?{' '}
          <button onClick={() => navigate('/register')} className="text-emerald-500 hover:text-emerald-400 font-bold">
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

// --- VIEW: REGISTER PAGE ---
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

      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        navigate('/');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-950 border border-emerald-500/30 rounded-3xl p-8 shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)]">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="SSW Logo" className="w-16 h-16 object-contain mx-auto mb-4" />
          <h1 className="text-2xl font-black uppercase tracking-tighter">Create Account</h1>
          <p className="text-zinc-500 text-[10px] font-bold tracking-[0.2em] mt-2">NODE_REGISTRATION</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="email"
            placeholder="EMAIL ADDRESS"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-black border-2 border-zinc-800 p-4 rounded-xl outline-none focus:border-emerald-500 text-sm"
            required
          />
          <input
            type="password"
            placeholder="PASSWORD"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full bg-black border-2 border-zinc-800 p-4 rounded-xl outline-none focus:border-emerald-500 text-sm"
            required
          />
          <input
            type="text"
            placeholder="COMPANY NAME"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            className="w-full bg-black border-2 border-zinc-800 p-4 rounded-xl outline-none focus:border-emerald-500 text-sm"
            required
          />
          <input
            type="tel"
            placeholder="PHONE NUMBER"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            className="w-full bg-black border-2 border-zinc-800 p-4 rounded-xl outline-none focus:border-emerald-500 text-sm"
          />

          {error && <p className="text-red-500 text-xs font-bold">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3 rounded-xl uppercase tracking-widest transition-all active:scale-95"
          >
            {loading ? 'REGISTERING...' : 'SIGN UP'}
          </button>
        </form>

        <p className="text-center text-zinc-600 text-sm mt-6">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="text-emerald-500 hover:text-emerald-400 font-bold">
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

// --- PROTECTED ROUTE CHECK ---
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  if (!token) {
    return null;
  }

  return children;
};

// --- THE ENGINE: PDF GENERATOR ---
const generateProfessionalPDF = (deal) => {
  try {
    const doc = new jsPDF();
    const company = (deal.companyName || "INTERNAL").toUpperCase();
    const isGoodDeal = (deal.verdict === 'ACCEPT');
    const accentColor = isGoodDeal ? [16, 185, 129] : [239, 68, 68];

    // Header Tech-Bar
    doc.setFillColor(30, 30, 30);
    doc.rect(0, 0, 210, 50, 'F');
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.rect(0, 45, 210, 5, 'F'); 

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("SANDILE SYSTEMSWORKS INTELLIGENCE", 14, 25);
    
    doc.setFontSize(10);
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text(`PROJECT STATUS: ${deal.verdict || 'ANALYZED'}`, 14, 35);
    doc.setTextColor(150);
    doc.text(`CLIENT: ${company}`, 14, 40);

    autoTable(doc, {
      startY: 60,
      head: [['Metric Analysis', 'Operational Value']],
      body: [
        ["Total Logistics Distance", `${deal.distance} KM`],
        ["Client Gross Offer", `R ${Number(deal.clientOffer).toLocaleString()}`],
        ["Current Fuel Benchmark", `R ${deal.fuelPrice}/L`],
        ["Calculated Operating Costs", `R ${Math.round(deal.totalCost).toLocaleString()}`],
        ["Net Projected Profit", `R ${Math.round(deal.profit).toLocaleString()}`],
        ["Efficiency Margin", `${Number(deal.margin).toFixed(2)}%`],
        ["Optimal Target (20%)", `R ${Math.round(deal.recommendedPrice).toLocaleString()}`]
      ],
      theme: 'striped',
      headStyles: { fillColor: accentColor },
      styles: { font: "courier", fontSize: 10 }
    });

    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`ENCRYPTED REPORT ID: ${deal._id || 'UNSAVED'} | ARCHIVE_NODE_01`, 14, 285);
    doc.save(`SSW_REPORT_${company}.pdf`);
  } catch (error) {
    console.error("PDF_CORE_CRASH:", error);
  }
};

// --- VIEW: SECURE SHARED NODE (PUBLIC - NO AUTH) ---
const SharedDealPage = () => {
  const { id } = useParams();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // 1. Define the fetch function inside the effect
    const fetchSharedDeal = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/deals/share/${id}`);
        const data = await response.json();

        if (data.error) {
          setError(data.error);
        } else {
          setDeal(data);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("CRITICAL_ERROR: Link invalid or expired.");
      } finally {
        // 2. Subtle delay to match your branding's "Logic Processing" feel
        setTimeout(() => setLoading(false), 800);
      }
    };

    fetchSharedDeal();
  }, [id]);

  // Handle Error State
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-red-500">
      <h1 className="text-2xl font-bold tracking-widest">ACCESS_DENIED</h1>
      <p className="mt-2 text-gray-500 uppercase tracking-tighter">{error}</p>
    </div>
  );

  // Handle Loading State
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-blue-500 font-mono text-sm tracking-widest uppercase">Decrypting_Node...</p>
      </div>
    </div>
  );

  // 3. Main Return (Your existing deal UI goes here)
  return (
    <div className="min-h-screen bg-slate-950 p-6">
       {/* Map your deal data (e.g., deal.origin, deal.payout) here */}
       <h1 className="text-white font-bold uppercase tracking-widest">Deal Node: {id}</h1>
       {/* ... rest of your UI ... */}
    </div>
  );
};

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <img src="/logo.png" alt="SSW" className="w-16 h-16 mb-6 opacity-20 animate-pulse" />
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-emerald-500 font-mono tracking-widest uppercase text-[10px]">Establishing Secure Link...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-red-500">
        <p className="font-black text-lg mb-4">{error}</p>
        <button onClick={() => window.location.href = '/#/'} className="text-emerald-500 hover:text-emerald-400 underline">← Back to Home</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
      <div className="max-w-xl w-full bg-zinc-950 border border-emerald-500/30 p-1 rounded-3xl shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)]">
        <div className="bg-black p-8 rounded-3xl border border-zinc-800">
            <div className="flex justify-between items-center mb-12">
                <img src="/logo.png" alt="SSW Logo" className="w-10 h-10 object-contain" />
                <div className="text-right">
                    <p className="text-[8px] text-zinc-500 uppercase tracking-widest">Node_Auth</p>
                    <p className="text-[10px] text-emerald-400 font-mono uppercase italic font-black">Verified_Output</p>
                </div>
            </div>

            <div className="space-y-8">
                <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                    <p className="text-zinc-500 text-[10px] uppercase font-bold mb-1">Projected Net Gain</p>
                    <p className="text-5xl font-black text-white font-mono">
                        R {Math.round(deal.profit).toLocaleString()}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="border border-zinc-800 p-4 rounded-xl">
                        <p className="text-zinc-500 text-[9px] uppercase">Margin</p>
                        <p className="text-xl font-bold text-emerald-500">{deal.margin?.toFixed(1)}%</p>
                    </div>
                    <div className="border border-zinc-800 p-4 rounded-xl">
                        <p className="text-zinc-500 text-[9px] uppercase">ROI Status</p>
                        <p className={`text-xl font-bold ${deal.verdict === 'ACCEPT' ? 'text-emerald-500' : 'text-red-500'}`}>
                            {deal.verdict}
                        </p>
                    </div>
                </div>
            </div>

            <button onClick={() => generateProfessionalPDF(deal)} className="w-full mt-12 bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)] active:scale-95">
                DOWNLOAD ENCRYPTED PDF
            </button>
        </div>
      </div>
    </div>
  );
};

// --- VIEW: MAIN OPERATIONS CENTER ---
const MainEngine = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('engine'); 
  const [savedDeals, setSavedDeals] = useState([]);
  const [inputs, setInputs] = useState({ distance: '', clientOffer: '', tolls: '', driverFee: '', companyName: '' });
  const [dieselPrice, setDieselPrice] = useState(25.50); 
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const fetchArchive = async () => {
    try {
      const res = await apiCall('/api/deals', {
        method: 'GET',
      });
      const data = await res.json();
      setSavedDeals(Array.isArray(data) ? data : []);
    } catch (e) {}
  };

  useEffect(() => { fetchArchive(); }, []);

  // --- THE NEW ENGINE ACTION (BACKEND LOGIC) ---
  const runLogicEngine = async () => {
    if(!inputs.companyName || !inputs.distance) return alert("REQUIRED: PROJECT_ID & DISTANCE");
    setIsLoading(true);
    
    try {
      const res = await apiCall('/api/deals', {
        method: 'POST',
        body: JSON.stringify({ ...inputs, fuelPrice: dieselPrice })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentResult(data);
        fetchArchive();
        setInputs({ distance: '', clientOffer: '', tolls: '', driverFee: '', companyName: '' });
      } else {
        alert(data.error || "Calculation failed");
      }
    } catch (err) { alert("NETWORK FAILURE"); }
    finally { setIsLoading(false); }
  };

  const deleteDeal = async (id) => {
    if (!window.confirm("Purge record?")) return;
    try {
        const res = await apiCall(`/api/deals/${id}`, { method: 'DELETE' });
        if (res.ok) setSavedDeals(prev => prev.filter(d => d._id !== id));
    } catch (err) { alert("DELETE_FAILED"); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500">
      {/* HUD Header with Logo */}
      <nav className="border-b border-zinc-800 p-6 flex justify-between items-center sticky top-0 bg-black/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
            <div>
                <h1 className="text-xl font-black tracking-tighter uppercase italic leading-none">Sandile SystemsWorks</h1>
                <p className="text-[8px] text-zinc-500 font-bold tracking-[.4em] mt-1">LOGISTICS_OPERATIONS_AI</p>
            </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              <button onClick={() => setView('engine')} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${view === 'engine' ? 'bg-emerald-500 text-black' : 'text-zinc-500 hover:text-white'}`}>Engine</button>
              <button onClick={() => setView('history')} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${view === 'history' ? 'bg-emerald-500 text-black' : 'text-zinc-500 hover:text-white'}`}>Archive</button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">User Node</p>
              <p className="text-sm font-bold text-white">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold text-[10px] uppercase rounded-lg transition-all">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="p-6 md:p-12 max-w-7xl mx-auto">
      {view === 'engine' ? (
        <div className="grid lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="space-y-6">
            <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-[2.5rem]">
              <h2 className="text-emerald-500 text-xs font-bold uppercase tracking-widest mb-8 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Input Console
              </h2>
              <div className="grid gap-6">
                <input type="text" placeholder="COMPANY NAME / ID" className="w-full bg-black border-2 border-zinc-800 p-5 rounded-2xl outline-none focus:border-emerald-500 font-bold tracking-widest uppercase" value={inputs.companyName} onChange={e => setInputs({...inputs, companyName: e.target.value})}/>
                <div className="grid grid-cols-2 gap-4">
                    <input type="number" placeholder="DISTANCE (KM)" className="w-full bg-black border border-zinc-800 p-4 rounded-xl outline-none focus:border-emerald-500 font-mono" onChange={e => setInputs({...inputs, distance: e.target.value})}/>
                    <input type="number" placeholder="OFFER (ZAR)" className="w-full bg-black border border-zinc-800 p-4 rounded-xl outline-none focus:border-emerald-500 font-mono text-emerald-500" onChange={e => setInputs({...inputs, clientOffer: e.target.value})}/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <input type="number" placeholder="TOLLS" className="bg-black border border-zinc-800 p-4 rounded-xl font-mono" onChange={e => setInputs({...inputs, tolls: e.target.value})}/>
                    <input type="number" placeholder="DRIVER FEE" className="bg-black border border-zinc-800 p-4 rounded-xl font-mono" onChange={e => setInputs({...inputs, driverFee: e.target.value})}/>
                </div>
                <div className="p-4 bg-zinc-900/50 rounded-xl flex justify-between items-center border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">Diesel Price (R/L)</span>
                    <input type="number" value={dieselPrice} onChange={e => setDieselPrice(e.target.value)} className="bg-black border border-amber-500/30 text-amber-500 font-mono w-20 text-center rounded p-1" />
                </div>
              </div>
              <button onClick={runLogicEngine} disabled={isLoading} className="w-full mt-8 bg-emerald-500 text-black font-black py-5 rounded-2xl uppercase tracking-[0.3em] active:scale-95 transition-all disabled:opacity-50">
                  {isLoading ? 'PROCESSING...' : 'RUN LOGIC ENGINE'}
              </button>
            </div>
          </div>

          {/* Results Display */}
          <div className={`relative p-10 rounded-[3rem] border-2 transition-all duration-700 overflow-hidden ${!currentResult ? 'opacity-20' : 'opacity-100'} ${currentResult?.verdict === 'REJECT' ? 'bg-red-500/[0.03] border-red-500/20' : 'bg-emerald-500/[0.03] border-emerald-500/40'}`}>
            {currentResult ? (
              <div className="relative z-10 flex flex-col h-full">
                <h3 className={`text-7xl font-black italic tracking-tighter ${currentResult.verdict === 'REJECT' ? 'text-red-500' : 'text-emerald-500'}`}>
                    {currentResult.verdict}
                </h3>
                <div className="mt-12 space-y-4">
                    <div className="bg-black/40 p-6 rounded-2xl border border-zinc-800 flex justify-between items-center">
                        <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Estimated Profit</span>
                        <span className="text-3xl font-mono text-white">R {Math.round(currentResult.profit).toLocaleString()}</span>
                    </div>
                    <div className="bg-black/40 p-6 rounded-2xl border border-zinc-800 flex justify-between items-center">
                        <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Margin</span>
                        <span className="text-2xl font-mono text-emerald-400">{currentResult.margin?.toFixed(1)}%</span>
                    </div>
                </div>
                <button onClick={() => generateProfessionalPDF(currentResult)} className="w-full mt-auto bg-zinc-900 text-white font-bold py-4 rounded-2xl text-[10px] uppercase border border-zinc-800">
                    Export Analysis PDF
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                 <img src="/logo.png" alt="" className="w-20 h-20 opacity-10 grayscale" />
                 <p className="text-zinc-800 font-black italic text-xl uppercase tracking-[0.2em]">Awaiting_Logic</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ARCHIVE VIEW */
        <div className="animate-in zoom-in-95 duration-500 bg-zinc-950 border border-zinc-900 rounded-[3rem] overflow-hidden shadow-2xl">
            <div className="p-10 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/20">
                <h2 className="text-xl font-black italic text-zinc-400">CLOUD ARCHIVE</h2>
                <div className="text-right">
                    <p className="text-2xl font-mono text-emerald-500">R {Math.round(savedDeals.reduce((a,b)=>a+(b.profit||0),0)).toLocaleString()}</p>
                    <p className="text-[8px] text-zinc-600 font-bold uppercase">Total Accrued Profit</p>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-black text-[9px] uppercase text-zinc-500 tracking-widest">
                        <tr>
                            <th className="p-8">Identity</th>
                            <th className="p-8">Profitability</th>
                            <th className="p-8 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="font-mono text-xs">
                        {savedDeals.length > 0 ? savedDeals.map((deal) => (
                            <tr key={deal._id} className="border-b border-zinc-900 hover:bg-emerald-500/[0.02]">
                                <td className="p-8">
                                    <p className="text-white font-black uppercase text-sm">{deal.companyName}</p>
                                    <p className="text-zinc-600 text-[9px] mt-1">{deal.distance} KM</p>
                                </td>
                                <td className={`p-8 text-lg font-bold ${deal.profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                    R {Math.round(deal.profit).toLocaleString()}
                                </td>
                                <td className="p-8 text-right space-x-6">
                                    <button onClick={() => window.open(`${window.location.origin}${window.location.pathname}#/share/${deal._id}`, '_blank')} className="text-zinc-500 hover:text-white uppercase font-black text-[10px] underline">Share</button>
                                    <button onClick={() => deleteDeal(deal._id)} className="text-red-900 hover:text-red-500 font-black text-[10px] uppercase">Delete</button>
                                </td>
                            </tr>
                        )) : (
                          <tr>
                            <td colSpan="3" className="p-12 text-center text-zinc-600">
                              No deals yet. Start by running the Logic Engine.
                            </td>
                          </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      )}
      </div>
    </div>
  );
};

// --- CORE APP ROUTING ---
const App = () => {
  const token = localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/share/:id" element={<SharedDealPage />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <MainEngine />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="*" 
          element={token ? <MainEngine /> : <LoginPage />} 
        />
      </Routes>
    </Router>
  );
};

export default App;
