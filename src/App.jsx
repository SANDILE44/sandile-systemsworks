import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const API_BASE_URL = "https://systems-j894.onrender.com";

// --- PROFESSIONAL PDF ENGINE ---
const generateProfessionalPDF = (deal) => {
  const doc = new jsPDF();
  const timestamp = new Date(deal.createdAt || Date.now()).toLocaleString();

  // Emerald Branding
  doc.setFillColor(16, 185, 129); 
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("SANDILE SYSTEMSWORKS", 14, 25);
  doc.setFontSize(10);
  doc.text("LOGISTICS INTELLIGENCE REPORT | RICHARDS BAY SECTOR", 14, 32);

  const tableData = [
    ["Metric", "Value"],
    ["Distance", `${deal.distance} KM`],
    ["Client Offer", `R ${Number(deal.clientOffer).toLocaleString()}`],
    ["Diesel Rate", `R ${deal.fuelPrice}/L`],
    ["Total Operating Cost", `R ${Math.round(deal.totalCost).toLocaleString()}`],
    ["Projected Net Profit", `R ${Math.round(deal.profit).toLocaleString()}`],
    ["Profit Margin", `${deal.margin?.toFixed(2)}%`],
    ["System Verdict", deal.verdict],
    ["Recommended Price", deal.recommendedPrice ? `R ${Math.round(deal.recommendedPrice).toLocaleString()}` : "N/A"]
  ];

  doc.autoTable({
    startY: 65,
    head: [['Strategic Analysis', 'Financial Breakdown']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] }
  });

  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text("© Sandile SystemsWorks - Enterprise Logistics Logic", 14, 285);
  doc.save(`SSW_Report_${deal._id || 'Draft'}.pdf`);
};

// --- VIEW 1: THE SHAREABLE RESULTS PAGE ---
const SharedDealPage = () => {
  const { id } = useParams();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/deals/${id}`)
      .then(res => res.json())
      .then(data => { setDeal(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-emerald-500 font-mono italic">ACCESSING CLOUD DATA...</div>;
  if (!deal) return <div className="min-h-screen bg-black flex items-center justify-center text-red-500 font-bold">REPORT NOT FOUND</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center">
      <div className="max-w-xl w-full bg-zinc-900 border border-emerald-500 p-10 rounded-3xl shadow-2xl">
        <h1 className="text-emerald-500 font-black italic text-xl mb-6 tracking-tighter">SANDILE SYSTEMSWORKS</h1>
        <div className="grid grid-cols-2 gap-6 mb-8 border-b border-zinc-800 pb-8 text-center">
          <div>
            <p className="text-[10px] text-zinc-500 uppercase font-bold">Net Profit</p>
            <p className="text-3xl font-mono text-emerald-400">R{Math.round(deal.profit).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 uppercase font-bold">Margin</p>
            <p className="text-3xl font-mono text-white">{deal.margin.toFixed(1)}%</p>
          </div>
        </div>
        <div className="space-y-4 mb-8 text-sm opacity-80">
          <div className="flex justify-between"><span>Distance:</span> <span>{deal.distance} KM</span></div>
          <div className="flex justify-between"><span>Offer:</span> <span>R{deal.clientOffer}</span></div>
          <div className="flex justify-between"><span>Verdict:</span> <span className="font-bold text-emerald-500">{deal.verdict}</span></div>
        </div>
        <button onClick={() => generateProfessionalPDF(deal)} className="w-full bg-emerald-500 text-black py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-emerald-400 transition-colors">Download Official Report</button>
      </div>
    </div>
  );
};

// --- VIEW 2: THE MAIN ENGINE ---
const MainEngine = () => {
  const [view, setView] = useState('engine'); 
  const [savedDeals, setSavedDeals] = useState([]);
  const [inputs, setInputs] = useState({ distance: '', clientOffer: '', tolls: '', driverFee: '' });
  const [dieselPrice, setDieselPrice] = useState(25.50); 
  const [isLoading, setIsLoading] = useState(false);

  const calculation = useMemo(() => {
    const dist = parseFloat(inputs.distance) || 0;
    const offer = parseFloat(inputs.clientOffer) || 0;
    const targetMargin = 0.20; 

    const costs = ((dist / 2.5) * dieselPrice) + (dist * 8.5) + (parseFloat(inputs.tolls) || 0) + (parseFloat(inputs.driverFee) || 0);
    const profit = offer - costs;
    const margin = offer > 0 ? (profit / offer) * 100 : 0;
    const recommendedPrice = costs / (1 - targetMargin);

    return { totalCost: costs, profit, margin, recommendedPrice };
  }, [inputs, dieselPrice]);

  const isRejected = calculation.margin < 15;

  const saveDeal = async () => {
    setIsLoading(true);
    const payload = { 
      ...inputs, 
      fuelPrice: dieselPrice, 
      ...calculation, 
      verdict: isRejected ? 'REJECT' : 'ACCEPT' 
    };
    try {
      const res = await fetch(`${API_BASE_URL}/api/deals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) alert("✅ LOGGED TO SECURE CLOUD");
    } catch (err) { alert("❌ CONNECTION FAILURE"); }
    finally { setIsLoading(false); }
  };

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/deals`);
      const data = await res.json();
      setSavedDeals(Array.isArray(data) ? data : []);
      setView('history');
    } catch (err) { setSavedDeals([]); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans p-6">
      <header className="flex justify-between items-center mb-12 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-xl font-black italic text-emerald-500 uppercase tracking-tighter">Sandile SystemsWorks</h1>
          <nav className="flex gap-6 mt-4">
            <button onClick={() => setView('engine')} className={`text-[10px] uppercase font-bold tracking-[0.2em] transition-colors ${view === 'engine' ? 'text-white' : 'text-zinc-600'}`}>Engine</button>
            <button onClick={fetchHistory} className={`text-[10px] uppercase font-bold tracking-[0.2em] transition-colors ${view === 'history' ? 'text-white' : 'text-zinc-600'}`}>History</button>
          </nav>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-zinc-500 uppercase font-bold">Manual Diesel Override</p>
          <input 
            type="number" 
            value={dieselPrice} 
            onChange={(e) => setDieselPrice(e.target.value)} 
            className="bg-transparent text-amber-400 font-mono text-xl w-24 text-right outline-none border-b border-zinc-800 focus:border-amber-400" 
          />
        </div>
      </header>

      {view === 'engine' ? (
        <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-xl">
            <h2 className="text-[10px] font-bold uppercase text-zinc-500 mb-6 tracking-[0.15em]">Cargo Input Matrix</h2>
            <div className="space-y-4">
              <input type="number" placeholder="Distance (KM)" className="w-full bg-black border border-zinc-800 p-4 rounded-xl outline-none focus:border-emerald-500 transition-all" onChange={(e) => setInputs({...inputs, distance: e.target.value})} />
              <input type="number" placeholder="Offer (ZAR)" className="w-full bg-black border border-zinc-800 p-4 rounded-xl outline-none focus:border-emerald-500 transition-all" onChange={(e) => setInputs({...inputs, clientOffer: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Tolls" className="bg-black border border-zinc-800 p-4 rounded-xl outline-none focus:border-emerald-500" onChange={(e) => setInputs({...inputs, tolls: e.target.value})} />
                <input type="number" placeholder="Driver" className="bg-black border border-zinc-800 p-4 rounded-xl outline-none focus:border-emerald-500" onChange={(e) => setInputs({...inputs, driverFee: e.target.value})} />
              </div>
            </div>
          </section>

          <section className={`p-8 rounded-3xl border flex flex-col justify-between transition-all duration-500 ${isRejected ? 'bg-red-950/10 border-red-500/50' : 'bg-emerald-950/10 border-emerald-500/50'}`}>
            <div className="text-center">
              <h3 className={`text-6xl font-black italic uppercase ${isRejected ? 'text-red-500' : 'text-emerald-500'}`}>{isRejected ? 'Reject' : 'Accept'}</h3>
              {isRejected && (
                <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-[10px] uppercase text-zinc-400">Negotiation Threshold</p>
                  <p className="text-xl text-emerald-400 font-bold">Recommended: R{Math.round(calculation.recommendedPrice).toLocaleString()}</p>
                </div>
              )}
            </div>
            <div className="space-y-3 mt-6">
              <button onClick={saveDeal} disabled={isLoading} className="w-full bg-emerald-500 text-black py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-emerald-400 transition-all disabled:opacity-50">Log to Cloud</button>
              <button onClick={() => generateProfessionalPDF({...inputs, ...calculation, fuelPrice: dieselPrice, verdict: isRejected ? 'REJECT' : 'ACCEPT'})} className="w-full bg-zinc-800 text-white py-3 rounded-xl text-[10px] font-bold uppercase hover:bg-zinc-700">Export Pro Report</button>
            </div>
          </section>
        </main>
      ) : (
        <main className="max-w-5xl mx-auto animate-in fade-in duration-500">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead className="bg-zinc-800/50 text-[9px] uppercase text-zinc-500"><tr className="border-b border-zinc-800"><th className="p-5">Date</th><th className="p-5">KM</th><th className="p-5">Profit</th><th className="p-5">Margin</th><th className="p-5 text-right">Actions</th></tr></thead>
              <tbody className="text-xs font-mono">
                {savedDeals.map((deal, i) => (
                  <tr key={i} className="border-b border-zinc-800 hover:bg-white/5 transition-colors">
                    <td className="p-5 text-zinc-500">{new Date(deal.createdAt).toLocaleDateString()}</td>
                    <td className="p-5">{deal.distance} KM</td>
                    <td className={`p-5 ${deal.profit > 0 ? 'text-emerald-400' : 'text-red-400'}`}>R{Math.round(deal.profit).toLocaleString()}</td>
                    <td className="p-5">{deal.margin?.toFixed(1)}%</td>
                    <td className="p-5 text-right space-x-4">
                      <button onClick={() => generateProfessionalPDF(deal)} className="text-emerald-500 hover:text-white transition-colors">PDF</button>
                      <button onClick={() => window.open(`/deal/${deal._id}`, '_blank')} className="text-zinc-500 hover:text-white transition-colors">Link</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      )}
    </div>
  );
};

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<MainEngine />} />
      <Route path="/deal/:id" element={<SharedDealPage />} />
    </Routes>
  </Router>
);

export default App;
