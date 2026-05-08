import React, { useState, useMemo, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_BASE_URL = "https://systems-j894.onrender.com";

// --- PDF GENERATION ENGINE ---
const generateProfessionalPDF = (deal) => {
  try {
    const doc = new jsPDF();
    const distance = Number(deal.distance) || 0;
    const offer = Number(deal.clientOffer) || 0;
    const fuel = Number(deal.fuelPrice || 0);
    const profit = Number(deal.profit || 0);
    const totalCost = Number(deal.totalCost || 0);
    const margin = Number(deal.margin || 0);
    const recommended = Number(deal.recommendedPrice || 0);
    const company = deal.companyName || "SANDILE SYSTEMSWORKS";

    doc.setFillColor(16, 185, 129); 
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("LOGISTICS INTELLIGENCE", 14, 25);
    doc.setFontSize(10);
    doc.text(`CLIENT: ${company.toUpperCase()}`, 14, 32);

    autoTable(doc, {
      startY: 50,
      head: [['Metric Analysis', 'Financial Value']],
      body: [
        ["Trip Distance", `${distance} KM`],
        ["Gross Offer Price", `R ${offer.toLocaleString()}`],
        ["Fuel Rate Applied", `R ${fuel.toFixed(2)}/L`],
        ["Operating Costs", `R ${Math.round(totalCost).toLocaleString()}`],
        ["Net Profit", `R ${Math.round(profit).toLocaleString()}`],
        ["Profit Margin", `${margin.toFixed(2)}%`],
        ["Target Price (20%)", `R ${Math.round(recommended).toLocaleString()}`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] }
    });

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Doc ID: ${deal._id || 'INTERNAL'} | Authored by Sandile SystemsWorks`, 14, 285);
    doc.save(`Report_${company.replace(/\s+/g, '_')}.pdf`);
  } catch (error) {
    console.error("PDF FAILURE:", error);
  }
};

// --- VIEW: SHARED REPORT ---
const SharedDealPage = () => {
  const { id } = useParams();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/deals/${id}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => { setDeal(data); setLoading(false); })
      .catch(() => { setDeal(null); setLoading(false); });
  }, [id]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-emerald-500 font-mono animate-pulse">ENCRYPTING DATA STREAM...</div>;
  if (!deal) return <div className="min-h-screen bg-black flex items-center justify-center text-red-500">ACCESS DENIED: INVALID TOKEN</div>;

  const roi = ((deal.profit / (deal.totalCost || 1)) * 100).toFixed(2);

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-10 flex flex-col items-center">
      <div className="max-w-2xl w-full bg-black border border-zinc-800 p-8 rounded-t-3xl shadow-2xl">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-emerald-500 font-black text-xl italic italic">SANDILE SYSTEMSWORKS</h1>
            <p className="text-[10px] text-zinc-500 tracking-[0.3em] uppercase">Secure Insight Node</p>
          </div>
          <span className="bg-emerald-500/10 text-emerald-500 text-[9px] px-3 py-1 rounded-full border border-emerald-500/20 font-bold uppercase">Verified</span>
        </div>
        <h2 className="text-3xl font-bold mb-8">Project Analysis</h2>
        <div className="space-y-4 mb-10">
          <div className="flex justify-between border-b border-zinc-900 pb-3">
            <span className="text-zinc-400">Net Profit</span>
            <span className={`font-mono font-bold ${deal.profit >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>
              R {Math.round(deal.profit).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between border-b border-zinc-900 pb-3">
            <span className="text-zinc-400">ROI</span>
            <span className="font-mono text-amber-500">{roi}%</span>
          </div>
        </div>
        <button onClick={() => generateProfessionalPDF(deal)} className="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-emerald-500 transition-all">
          Download PDF Report
        </button>
      </div>
    </div>
  );
};

// --- VIEW: MAIN ENGINE ---
const MainEngine = () => {
  const [view, setView] = useState('engine'); 
  const [savedDeals, setSavedDeals] = useState([]);
  const [inputs, setInputs] = useState({ distance: '', clientOffer: '', tolls: '', driverFee: '', companyName: '' });
  const [dieselPrice, setDieselPrice] = useState(25.50); 
  const [isLoading, setIsLoading] = useState(false);

  // Financial Stats Tracker
  const cloudStats = useMemo(() => {
    const totalRevenue = savedDeals.reduce((acc, deal) => acc + (Number(deal.clientOffer) || 0), 0);
    const totalProfit = savedDeals.reduce((acc, deal) => acc + (Number(deal.profit) || 0), 0);
    return { totalRevenue, totalProfit };
  }, [savedDeals]);

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

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const url = inputs.companyName 
        ? `${API_BASE_URL}/api/deals?company=${inputs.companyName}` 
        : `${API_BASE_URL}/api/deals`;
      const res = await fetch(url);
      const data = await res.json();
      setSavedDeals(Array.isArray(data) ? data : []);
      setView('history');
    } catch (err) { setSavedDeals([]); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchHistory(); }, []); // Load stats on mount

  const saveDeal = async () => {
    if(!inputs.companyName) return alert("ENTER COMPANY NAME TO TAG DATA");
    setIsLoading(true);
    const payload = { ...inputs, fuelPrice: dieselPrice, ...calculation, verdict: isRejected ? 'REJECT' : 'ACCEPT' };
    try {
      const res = await fetch(`${API_BASE_URL}/api/deals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert(`LOGGED TO ${inputs.companyName.toUpperCase()} CLOUD`);
        fetchHistory();
      }
    } catch (err) { alert("CONNECTION ERROR"); }
    finally { setIsLoading(false); }
  };

  const deleteDeal = async (id) => {
    if (!window.confirm("ARE YOU SURE? THIS ACTION PERMANENTLY ERASES CLOUD DATA.")) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/deals/${id}`, { method: 'DELETE' });
      if (res.ok) setSavedDeals(savedDeals.filter(d => d._id !== id));
    } catch (err) { alert("DELETE FAILED"); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans p-6 selection:bg-emerald-500 selection:text-black">
      <header className="flex flex-col md:flex-row justify-between items-start mb-12 border-b border-zinc-900 pb-8 gap-6">
        <div>
          <h1 className="text-2xl font-black italic text-emerald-500 uppercase tracking-tighter">Sandile SystemsWorks</h1>
          <p className="text-[9px] text-zinc-600 font-bold tracking-[0.3em] mt-1">OPERATIONAL ROI ENGINE</p>
          <nav className="flex gap-8 mt-6">
            <button onClick={() => setView('engine')} className={`text-[11px] uppercase font-bold tracking-widest transition-all ${view === 'engine' ? 'text-emerald-500 border-b border-emerald-500' : 'text-zinc-600 hover:text-zinc-400'}`}>The Engine</button>
            <button onClick={fetchHistory} className={`text-[11px] uppercase font-bold tracking-widest transition-all ${view === 'history' ? 'text-emerald-500 border-b border-emerald-500' : 'text-zinc-600 hover:text-zinc-400'}`}>Database History</button>
          </nav>
        </div>

        {/* CLOUD FINANCIAL TRACKER */}
        <div className="flex gap-4 w-full md:w-auto">
          <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex-1 md:flex-none min-w-[140px]">
             <p className="text-[8px] text-zinc-500 uppercase font-bold mb-1">Cumulative Cloud Profit</p>
             <p className={`text-xl font-mono font-bold ${cloudStats.totalProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                R{Math.round(cloudStats.totalProfit).toLocaleString()}
             </p>
          </div>
          <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
            <p className="text-[8px] text-zinc-500 uppercase font-bold mb-1 text-center">Global Fuel Rate</p>
            <input type="number" value={dieselPrice} onChange={(e) => setDieselPrice(e.target.value)} className="bg-transparent text-amber-500 font-mono text-xl w-20 outline-none text-center" />
          </div>
        </div>
      </header>

      {view === 'engine' ? (
        <main className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
          <section className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2rem]">
            <h2 className="text-[11px] font-bold uppercase text-zinc-500 mb-8 tracking-widest border-l-2 border-emerald-500 pl-4">Variable Input Console</h2>
            <div className="space-y-6">
              <div className="group">
                <label className="text-[9px] text-emerald-500 uppercase ml-2 italic">Client / Project ID</label>
                <input type="text" placeholder="Enter Company Name" className="w-full bg-zinc-950 border border-emerald-500/20 p-5 rounded-2xl outline-none focus:border-emerald-500 text-lg font-bold" value={inputs.companyName} onChange={(e) => setInputs({...inputs, companyName: e.target.value})} />
              </div>
              <div className="group">
                <label className="text-[9px] text-zinc-500 uppercase ml-2">Total Distance (KM)</label>
                <input type="number" placeholder="0.00" className="w-full bg-zinc-950 border border-zinc-800 p-5 rounded-2xl outline-none focus:border-emerald-500 text-xl font-mono" onChange={(e) => setInputs({...inputs, distance: e.target.value})} />
              </div>
              <div className="group">
                <label className="text-[9px] text-zinc-500 uppercase ml-2">Client Gross Offer (ZAR)</label>
                <input type="number" placeholder="0.00" className="w-full bg-zinc-950 border border-zinc-800 p-5 rounded-2xl outline-none focus:border-emerald-500 text-xl font-mono" onChange={(e) => setInputs({...inputs, clientOffer: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <input type="number" placeholder="Tolls" className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl outline-none focus:border-emerald-500" onChange={(e) => setInputs({...inputs, tolls: e.target.value})} />
                <input type="number" placeholder="Driver/Misc" className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl outline-none focus:border-emerald-500" onChange={(e) => setInputs({...inputs, driverFee: e.target.value})} />
              </div>
            </div>
          </section>

          <section className={`p-10 rounded-[2rem] border-2 flex flex-col justify-between transition-all duration-500 ${isRejected ? 'bg-red-950/10 border-red-600/40' : 'bg-emerald-950/10 border-emerald-600/40'}`}>
            <div>
               <div className="flex justify-between items-start mb-10">
                 <div>
                   <h3 className={`text-5xl font-black italic uppercase tracking-tighter ${isRejected ? 'text-red-500' : 'text-emerald-500'}`}>{isRejected ? 'Reject' : 'Accept'}</h3>
                   <p className="text-[10px] text-zinc-500 font-bold uppercase mt-2">Analysis Verdict</p>
                 </div>
                 <div className="text-right">
                   <p className={`text-4xl font-mono ${calculation.margin >= 15 ? 'text-emerald-400' : 'text-red-400'}`}>{calculation.margin.toFixed(1)}%</p>
                   <p className="text-[10px] text-zinc-500 font-bold uppercase">Net Margin</p>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800">
                    <p className="text-[9px] text-zinc-500 uppercase">Operational Costs</p>
                    <p className="text-lg font-mono">R{Math.round(calculation.totalCost).toLocaleString()}</p>
                 </div>
                 <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800">
                    <p className="text-[9px] text-zinc-500 uppercase">Estimated Profit</p>
                    <p className={`text-lg font-mono font-bold ${calculation.profit > 0 ? 'text-emerald-400' : 'text-red-500'}`}>R{Math.round(calculation.profit).toLocaleString()}</p>
                 </div>
               </div>

               <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                 <p className="text-[10px] uppercase text-zinc-400 mb-1 font-bold">20% Margin Target Price</p>
                 <p className="text-2xl text-emerald-400 font-mono italic">R{Math.round(calculation.recommendedPrice).toLocaleString()}</p>
               </div>
            </div>

            <div className="space-y-4 mt-12">
              <button 
                onClick={saveDeal} 
                disabled={isLoading} 
                className="w-full bg-emerald-500 text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-wait"
              >
                {isLoading ? 'Synchronizing Cloud...' : 'Log to Secure Cloud'}
              </button>
              <button onClick={() => generateProfessionalPDF({...inputs, ...calculation, fuelPrice: dieselPrice})} className="w-full bg-zinc-800 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700 transition-all">
                Export Intelligence PDF
              </button>
            </div>
          </section>
        </main>
      ) : (
        <main className="max-w-6xl mx-auto animate-in zoom-in-95 duration-500">
          <div className="bg-zinc-950 border border-zinc-900 rounded-[2rem] overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-zinc-900 flex justify-between items-center">
                <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Cloud Archive Tracking</h2>
                <div className="flex gap-4 items-center">
                  <p className="text-[10px] font-mono text-emerald-500">Total Entries: {savedDeals.length}</p>
                  <button onClick={() => {setInputs({...inputs, companyName: ''}); fetchHistory();}} className="text-[10px] text-zinc-500 underline uppercase">Reset View</button>
                </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-zinc-900/50 text-[10px] uppercase text-zinc-500 border-b border-zinc-900">
                  <tr>
                    <th className="p-6">Client Identity</th>
                    <th className="p-6">Distance</th>
                    <th className="p-6">Profit Analysis</th>
                    <th className="p-6">Margin</th>
                    <th className="p-6 text-right">Operational Actions</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-mono">
                  {savedDeals.map((deal) => (
                    <tr key={deal._id} className="border-b border-zinc-900/50 hover:bg-emerald-500/[0.02] transition-colors group">
                      <td className="p-6 text-zinc-400 font-bold uppercase">{deal.companyName || 'N/A'}</td>
                      <td className="p-6">{deal.distance} KM</td>
                      <td className={`p-6 font-bold ${deal.profit > 0 ? 'text-emerald-400' : 'text-red-500'}`}>R{Math.round(deal.profit).toLocaleString()}</td>
                      <td className={`p-6 ${deal.margin >= 15 ? 'text-emerald-500/60' : 'text-red-500/60'}`}>{deal.margin?.toFixed(1)}%</td>
                      <td className="p-6 text-right space-x-4">
                        <button onClick={() => generateProfessionalPDF(deal)} className="text-emerald-500 hover:text-white uppercase text-[10px] font-bold">PDF</button>
                        <button onClick={() => window.open(`${window.location.origin}/#/deal/${deal._id}`, '_blank')} className="text-zinc-400 hover:text-white uppercase text-[10px] font-bold underline">Share</button>
                        <button onClick={() => deleteDeal(deal._id)} disabled={isLoading} className="text-red-900 hover:text-red-500 uppercase text-[10px] font-bold disabled:opacity-30">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
      <Route path="*" element={<MainEngine />} />
    </Routes>
  </Router>
);

export default App;
