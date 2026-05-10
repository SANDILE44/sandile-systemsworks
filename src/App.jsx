import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import HomePage from './HomePage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';

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
    window.location.href = '#/login';
  }

  return response;
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

  if (!token) return null;
  return children;
};

// --- LOGIN COMPONENT ---
// LoginPage is defined in ./LoginPage.jsx

// --- THE ENGINE: PDF GENERATOR ---
const generateProfessionalPDF = (deal) => {
  try {
    const doc = new jsPDF();
    const company = (deal.companyName || "INTERNAL").toUpperCase();
    const isGoodDeal = (deal.verdict === 'ACCEPT');
    const accentColor = isGoodDeal ? [16, 185, 129] : [239, 68, 68];

    doc.setFillColor(30, 30, 30);
    doc.rect(0, 0, 210, 50, 'F');
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.rect(0, 45, 210, 5, 'F'); 

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("ZON LOGICS INTELLIGENCE", 14, 25);
    
    autoTable(doc, {
      startY: 60,
      head: [['Metric', 'Value']],
      body: [
        ["Logistics Distance", `${deal.distance} KM`],
        ["Offer Received", `R ${Number(deal.clientOffer).toLocaleString()}`],
        ["Projected Profit", `R ${Math.round(deal.profit).toLocaleString()}`],
        ["Margin", `${Number(deal.margin).toFixed(2)}%`]
      ],
      headStyles: { fillColor: accentColor }
    });

    doc.save(`ZON_REPORT_${company}.pdf`);
  } catch (error) { console.error(error); }
};

// --- VIEW: SHARED PAGE ---
const SharedDealPage = () => {
  const { id } = useParams();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/deals/share/${id}`)
      .then(res => res.json())
      .then(data => { setDeal(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="bg-black min-h-screen text-emerald-500 flex items-center justify-center font-mono">LOADING_LINK...</div>;
  if (!deal) return <div className="bg-black min-h-screen text-red-500 flex items-center justify-center font-mono">LINK_EXPIRED</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
      <div className="max-w-xl w-full bg-zinc-950 border border-emerald-500/30 p-8 rounded-3xl">
        <h2 className="text-zinc-500 uppercase text-[10px] mb-2 font-bold tracking-widest">Shared Analysis</h2>
        <p className="text-5xl font-black mb-8 font-mono">R {Math.round(deal.profit).toLocaleString()}</p>
        <button onClick={() => generateProfessionalPDF(deal)} className="w-full bg-emerald-500 text-black font-black py-4 rounded-xl uppercase">Download Report</button>
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
  const [dieselPrice] = useState(25.50); 
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);

  const fetchArchive = async () => {
    const res = await apiCall('/api/deals', { method: 'GET' });
    const data = await res.json();
    if (Array.isArray(data)) setSavedDeals(data);
  };

  useEffect(() => { fetchArchive(); }, []);

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
      }
    } catch (err) { alert("NETWORK FAILURE"); }
    finally { setIsLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <nav className="border-b border-zinc-800 p-6 flex justify-between items-center sticky top-0 bg-black/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center font-black text-black">ZL</div>
            <div>
                <h1 className="text-xl font-black tracking-tighter uppercase italic leading-none">Zon Logics</h1>
                <p className="text-[8px] text-zinc-500 font-bold tracking-[.4em] mt-1">LOGISTICS_AI</p>
            </div>
        </div>
        <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              <button onClick={() => setView('engine')} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase ${view === 'engine' ? 'bg-emerald-500 text-black' : 'text-zinc-500'}`}>Engine</button>
              <button onClick={() => setView('history')} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase ${view === 'history' ? 'bg-emerald-500 text-black' : 'text-zinc-500'}`}>Archive</button>
        </div>
        <button onClick={handleLogout} className="px-4 py-2 bg-red-500/10 text-red-500 font-bold text-[10px] uppercase rounded-lg">Logout</button>
      </nav>

      <div className="p-6 md:p-12 max-w-7xl mx-auto">
      {view === 'engine' ? (
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-[2.5rem]">
            <h2 className="text-emerald-500 text-xs font-bold uppercase tracking-widest mb-8">Input Console</h2>
            <div className="grid gap-6">
              <input type="text" placeholder="COMPANY NAME" className="w-full bg-black border-2 border-zinc-800 p-5 rounded-2xl outline-none focus:border-emerald-500 uppercase font-black" value={inputs.companyName} onChange={e => setInputs({...inputs, companyName: e.target.value})}/>
              <input type="number" placeholder="DISTANCE (KM)" className="w-full bg-black border border-zinc-800 p-4 rounded-xl" value={inputs.distance} onChange={e => setInputs({...inputs, distance: e.target.value})}/>
              <input type="number" placeholder="OFFER (ZAR)" className="w-full bg-black border border-zinc-800 p-4 rounded-xl" value={inputs.clientOffer} onChange={e => setInputs({...inputs, clientOffer: e.target.value})}/>
            </div>
            <button onClick={runLogicEngine} disabled={isLoading} className="w-full mt-8 bg-emerald-500 text-black font-black py-5 rounded-2xl uppercase">
                {isLoading ? 'PROCESSING...' : 'RUN LOGIC ENGINE'}
            </button>
          </div>
          <div className={`p-10 rounded-[3rem] border-2 flex items-center justify-center ${!currentResult ? 'opacity-20 border-zinc-800' : 'border-emerald-500'}`}>
            {currentResult ? (
              <div className="text-center">
                <h3 className="text-7xl font-black italic text-emerald-500 mb-4">{currentResult.verdict}</h3>
                <p className="text-4xl font-mono">R {Math.round(currentResult.profit).toLocaleString()}</p>
              </div>
            ) : <p className="font-black italic text-zinc-800">AWAITING_INPUT</p>}
          </div>
        </div>
      ) : (
        <div className="bg-zinc-950 border border-zinc-900 rounded-[3rem] p-10">
            <h2 className="text-xl font-black italic text-zinc-400 mb-8">CLOUD ARCHIVE</h2>
            {savedDeals.map(deal => (
                <div key={deal._id} className="border-b border-zinc-900 p-6 flex justify-between">
                    <div>
                        <p className="font-black uppercase">{deal.companyName}</p>
                        <p className="text-zinc-600 text-[9px] font-mono">{deal.distance} KM</p>
                    </div>
                    <p className="text-emerald-500 font-bold">R {Math.round(deal.profit).toLocaleString()}</p>
                </div>
            ))}
        </div>
      )}
      </div>
    </div>
  );
};

// --- CORE APP ROUTING ---
const App = () => {
  return (
    <Router>
      <Routes>
        {/* 1. This MUST be public and bare */}
        <Route path="/" element={<HomePage />} />
        
        {/* 2. Auth routes must also be public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* 3. ONLY this one gets the ProtectedRoute wrapper */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <MainEngine />
            </ProtectedRoute>
          } 
        />
        <Route path="/share/:id" element={<SharedDealPage />} />

        {/* 4. Fallback */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Router>
  );
};

export default App;
