import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const API_BASE_URL = "https://systems-j894.onrender.com";

// --- PROFESSIONAL PDF ENGINE ---
const generateProfessionalPDF = (deal) => {
  const doc = new jsPDF();
  const timestamp = new Date(deal.createdAt || Date.now()).toLocaleString();

  // Branding Header
  doc.setFillColor(16, 185, 129); // Emerald 500
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("SANDILE SYSTEMSWORKS", 14, 25);
  doc.setFontSize(10);
  doc.text("LOGISTICS INTELLIGENCE REPORT | RICHARDS BAY SECTOR", 14, 32);

  // Data Section
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(10);
  doc.text(`Reference ID: ${deal._id || 'INTERNAL_DRAFT'}`, 14, 50);
  doc.text(`Generated: ${timestamp}`, 14, 55);

  const tableData = [
    ["Metric", "Value"],
    ["Distance", `${deal.distance} KM`],
    ["Client Offer", `R ${Number(deal.clientOffer).toLocaleString()}`],
    ["Diesel Price", `R ${deal.fuelPrice}/L`],
    ["Total Trip Cost", `R ${Math.round(deal.totalCost).toLocaleString()}`],
    ["Net Profit", `R ${Math.round(deal.profit).toLocaleString()}`],
    ["Margin", `${deal.margin?.toFixed(2)}%`],
    ["Final Verdict", deal.verdict]
  ];

  doc.autoTable({
    startY: 65,
    head: [['Logistics Analysis', 'Breakdown']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] }
  });

  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text("Confidential Algorithm Output - Sandile SystemsWorks", 14, 285);
  doc.save(`SSW_Report_${deal._id || 'New'}.pdf`);
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

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-emerald-500 font-mono italic">SCANNING CLOUD DATA...</div>;
  if (!deal) return <div className="min-h-screen bg-black flex items-center justify-center text-red-500 font-bold">DEAL NOT FOUND</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center">
      <div className="max-w-xl w-full bg-zinc-900 border border-emerald-500 p-10 rounded-3xl shadow-2xl">
        <h1 className="text-emerald-500 font-black italic text-xl mb-6">SANDILE SYSTEMSWORKS</h1>
        <div className="grid grid-cols-2 gap-6 mb-8 border-b border-zinc-800 pb-8">
          <div>
            <p className="text-[10px] text-zinc-500 uppercase font-bold">Projected Profit</p>
            <p className="text-3xl font-mono text-emerald-400">R{Math.round(deal.profit).toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-zinc-500 uppercase font-bold">Margin</p>
            <p className="text-3xl font-mono text-white">{deal.margin.toFixed(1)}%</p>
          </div>
        </div>
        <div className="space-y-4 mb-8 text-sm opacity-80">
          <div className="flex justify-between"><span>Distance:</span> <span>{deal.distance} KM</span></div>
          <div className="flex justify-between"><span>Client Offer:</span> <span>R{deal.clientOffer}</span></div>
          <div className="flex justify-between"><span>Verdict:</span> <span className="font-bold text-emerald-500">{deal.verdict}</span></div>
        </div>
        <button onClick={() => generateProfessionalPDF(deal)} className="w-full bg-emerald-500 text-black py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-emerald-400">Download Official PDF</button>
      </div>
    </div>
  );
};

// --- VIEW 2: THE MAIN ENGINE ---
const MainEngine = () => {
  const [view, setView] = useState('engine'); 
  const [savedDeals, setSavedDeals] = useState([]);
  const [inputs, setInputs] = useState({ distance: '', clientOffer: '', tolls: '', driverFee: '' });
  const [dieselPrice] = useState(30.85);
  const [isLoading, setIsLoading] = useState(false);

  const calculation = useMemo(() => {
    const dist = parseFloat(inputs.distance) || 0;
    const offer = parseFloat(inputs.clientOffer) || 0;
    const costs = ((dist / 2.5) * dieselPrice) + (dist * 8.5) + (parseFloat(inputs.tolls) || 0) + (parseFloat(inputs.driverFee) || 0);
    const profit = offer - costs;
    const margin = offer > 0 ? (profit / offer) * 100 : 0;
    return { totalCost: costs, profit, margin };
  }, [inputs, dieselPrice]);

  const totalLifetimeProfit = useMemo(() => {
    return Array.isArray(savedDeals) ? savedDeals.reduce((sum, d) => sum + (d.profit || 0), 0) : 0;
  }, [savedDeals]);

  const saveDeal = async () => {
    setIsLoading(true);
    const payload = { ...inputs, fuelPrice: dieselPrice, ...calculation, verdict: calculation.margin < 15 ? 'REJECT' : 'ACCEPT' };
    try {
      const res = await fetch(`${API_BASE_URL}/api/deals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) alert("✅ LOGGED TO CLOUD");
    } catch (err) { alert("❌ SYNC FAILED"); }
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

  const shareDeal = async (deal) => {
    const shareUrl = `${window.location.origin}/deal/${deal._id}`;
    if (navigator.share) {
      await navigator.share({ title: 'SSW Logistics Report', url: shareUrl });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Professional Link Copied!");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans p-6">
      <header className="flex justify-between items-center mb-12 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-xl font-black italic text-emerald-500 uppercase tracking-tighter">Sandile SystemsWorks</h1>
          <nav className="flex gap-6 mt-4">
            <button onClick={() => setView('engine')} className={`text-[10px] uppercase font-bold tracking-[0.2em] ${view === 'engine' ? 'text-white' : 'text-zinc-600'}`}>Engine</button>
            <button onClick={fetchHistory} className={`text-[10px] uppercase font-bold tracking-[0.2em] ${view === 'history' ? 'text-white' : 'text-zinc-600'}`}>History</button>
          </nav>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Diesel</p>
          <p className="text-xl font-mono text-amber-400 font-bold">R{dieselPrice.toFixed(2)}</p>
        </div>
      </header>

      {view === 'engine' ? (
        <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl">
            <h2 className="text-[10px] font-bold uppercase text-zinc-500 mb-6">Input Matrix</h2>
            <div className="space-y-4">
              <input type="number" placeholder="Distance (KM)" className="w-full bg-black border border-zinc-800 p-4 rounded-xl outline-none focus:border-emerald-500" onChange={(e) => setInputs({...inputs, distance: e.target.value})} />
              <input type="number" placeholder="Offer (ZAR)" className="w-full bg-black border border-zinc-800 p-4 rounded-xl outline-none focus:border-emerald-500" onChange={(e) => setInputs({...inputs, clientOffer: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Tolls" className="bg-black border border-zinc-800 p-4 rounded-xl" onChange={(e) => setInputs({...inputs, tolls: e.target.value})} />
                <input type="number" placeholder="Driver" className="bg-black border border-zinc-800 p-4 rounded-xl" onChange={(e) => setInputs({...inputs, driverFee: e.target.value})} />
              </div>
            </div>
          </section>

          <section className={`p-8 rounded-2xl border transition-all ${calculation.margin < 15 ? 'bg-red-950/10 border-red-500/50' : 'bg-emerald-950/10 border-emerald-500/50'}`}>
            <div className="text-center mb-10">
              <h3 className={`text-6xl font-black italic uppercase ${calculation.margin < 15 ? 'text-red-500' : 'text-emerald-500'}`}>{calculation.margin < 15 ? 'Reject' : 'Accept'}</h3>
              <p className="text-xs mt-2 text-zinc-500">Projected Margin: {calculation.margin.toFixed(1)}%</p>
            </div>
            <div className="space-y-3">
              <button onClick={saveDeal} disabled={isLoading} className="w-full bg-emerald-500 text-black py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-emerald-400 disabled:opacity-50">Log to Cloud</button>
              <button onClick={() => generateProfessionalPDF({...inputs, ...calculation, fuelPrice: dieselPrice, verdict: calculation.margin < 15 ? 'REJECT' : 'ACCEPT'})} className="w-full bg-zinc-800 text-white py-3 rounded-xl text-[10px] font-bold uppercase hover:bg-zinc-700">Export Pro PDF</button>
            </div>
          </section>
        </main>
      ) : (
        <main className="max-w-5xl mx-auto">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-xl font-bold italic text-emerald-500 uppercase">Operations History</h2>
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-right">
              <p className="text-[10px] text-zinc-500 uppercase font-bold">Lifetime Profit</p>
              <p className="text-xl font-mono text-emerald-500">R{Math.round(totalLifetimeProfit).toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-zinc-800/50 text-[9px] uppercase text-zinc-500">
                <tr><th className="p-5">Date</th><th className="p-5">KM</th><th className="p-5">Profit</th><th className="p-5">Margin</th><th className="p-5 text-right">Action</th></tr>
              </thead>
              <tbody className="text-xs font-mono">
                {savedDeals.map((deal, i) => (
                  <tr key={i} className="border-t border-zinc-800 hover:bg-white/5">
                    <td className="p-5 text-zinc-500">{new Date(deal.createdAt).toLocaleDateString()}</td>
                    <td className="p-5">{deal.distance} KM</td>
                    <td className={`p-5 ${deal.profit > 0 ? 'text-emerald-500' : 'text-red-500'}`}>R{Math.round(deal.profit).toLocaleString()}</td>
                    <td className="p-5">{deal.margin?.toFixed(1)}%</td>
                    <td className="p-5 text-right space-x-3">
                      <button onClick={() => generateProfessionalPDF(deal)} className="text-emerald-500 hover:underline">PDF</button>
                      <button onClick={() => shareDeal(deal)} className="text-zinc-500 hover:underline">Share</button>
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

// --- FINAL APP ROUTER ---
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainEngine />} />
        <Route path="/deal/:id" element={<SharedDealPage />} />
      </Routes>
    </Router>
  );
};

export default App;