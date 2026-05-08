import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { jsPDF } from 'jspdf'; // Use curly braces
import autoTable from 'jspdf-autotable'; // Import autoTable directly

const API_BASE_URL = "https://systems-j894.onrender.com";

// --- PDF GENERATION ENGINE (Fixed Keys) ---
const generateProfessionalPDF = (deal) => {
  try {
    const doc = new jsPDF();
    
    // 1. SAFE DATA EXTRACTION (Prevents NaN Errors)
    const distance = Number(deal.distance) || 0;
    const offer = Number(deal.clientOffer) || 0;
    const fuel = Number(deal.fuelPrice || 0);
    const profit = Number(deal.profit || 0);
    const totalCost = Number(deal.totalCost || 0);
    const margin = Number(deal.margin || 0);
    const recommended = Number(deal.recommendedPrice || 0);
    const company = deal.companyName || "SANDILE SYSTEMSWORKS";

    // 2. HEADER DESIGN
    doc.setFillColor(16, 185, 129); // Emerald Green
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("LOGISTICS INTELLIGENCE", 14, 25);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`CLIENT: ${company.toUpperCase()}`, 14, 32);

    // 3. TABLE BODY
    const tableData = [
      ["Metric Analysis", "Financial Value"],
      ["Trip Distance", `${distance} KM`],
      ["Gross Offer Price", `R ${offer.toLocaleString()}`],
      ["Fuel Rate Applied", `R ${fuel.toFixed(2)}/L`],
      ["Operating Costs", `R ${Math.round(totalCost).toLocaleString()}`],
      ["Net Profit", `R ${Math.round(profit).toLocaleString()}`],
      ["Profit Margin", `${margin.toFixed(2)}%`],
      ["Target Price (20%)", `R ${Math.round(recommended).toLocaleString()}`]
    ];

    // 4. GENERATE TABLE
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

    // 5. FOOTER
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Doc ID: ${deal._id || 'INTERNAL'} | Authored by Sandile SystemsWorks`, 14, 285);
    
    // 6. FINAL SAVE
    doc.save(`Report_${company.replace(/\s+/g, '_')}.pdf`);

  } catch (error) {
    console.error("CRITICAL PDF GENERATION FAILURE:", error);
    alert("PDF Engine Error: Check console for data integrity issues.");
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

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-emerald-500 font-mono">ENCRYPTED DATA STREAM...</div>;
  if (!deal) return <div className="min-h-screen bg-black flex items-center justify-center text-red-500">ACCESS DENIED: INVALID TOKEN</div>;

  // Premium Calculations
  const roi = ((deal.profit / (deal.totalCost || 1)) * 100).toFixed(2);
  const date = new Date().toLocaleDateString();

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-10 flex flex-col items-center">
      <div className="max-w-2xl w-full bg-black border border-zinc-800 p-8 rounded-t-3xl shadow-2xl">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-emerald-500 font-black text-xl italic leading-none">SANDILE SYSTEMSWORKS</h1>
            <p className="text-[10px] text-zinc-500 tracking-[0.3em] uppercase">Project Insight Unit</p>
          </div>
          <div className="text-right">
            <span className="bg-emerald-500/10 text-emerald-500 text-[9px] px-3 py-1 rounded-full border border-emerald-500/20 font-bold uppercase">Verified Analysis</span>
          </div>
        </div>

        <h2 className="text-3xl font-bold mb-2">Project Analysis Results</h2>
        <p className="text-zinc-500 text-sm mb-8 italic">Consulting Analysis Report for {deal.companyName || 'Private Client'}</p>

        <div className="space-y-4 mb-10">
          <div className="flex justify-between border-b border-zinc-900 pb-3">
            <span className="text-zinc-400">Net Profit</span>
            <span className={`font-mono font-bold ${deal.profit >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>
              R {Math.round(deal.profit).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between border-b border-zinc-900 pb-3">
            <span className="text-zinc-400">Profit Margin</span>
            <span className="font-mono">{deal.margin?.toFixed(2)}%</span>
          </div>
          <div className="flex justify-between border-b border-zinc-900 pb-3">
            <span className="text-zinc-400">Return on Investment (ROI)</span>
            <span className="font-mono text-amber-500">{roi}%</span>
          </div>
          <div className="flex justify-between border-b border-zinc-900 pb-3">
            <span className="text-zinc-400">Final Decision</span>
            <span className={`font-bold uppercase ${deal.margin >= 15 ? 'text-emerald-500' : 'text-red-600'}`}>
              {deal.margin >= 15 ? 'Accept Trip' : 'Reject Trip'}
            </span>
          </div>
        </div>

        <button onClick={() => generateProfessionalPDF(deal)} className="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-emerald-500 transition-all mb-4">
          Download PDF Report
        </button>
      </div>

      <div className="max-w-2xl w-full bg-zinc-900/50 p-6 rounded-b-3xl border-x border-b border-zinc-800 text-center">
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
          Sandile SystemsWorks SaaS • {date}
        </p>
        <p className="text-[9px] text-zinc-600 mt-1">
          Proprietary Decision Engine © 2026 | Secure Analysis Verified
        </p>
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
        // Refresh history after saving
        fetchHistory();
      }
    } catch (err) { alert("CONNECTION ERROR"); }
    finally { setIsLoading(false); }
  };

  const deleteDeal = async (id) => {
    if (!window.confirm("ARE YOU SURE? THIS ACTION PERMANENTLY ERASES CLOUD DATA.")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/deals/${id}`, { method: 'DELETE' });
      if (res.ok) setSavedDeals(savedDeals.filter(d => d._id !== id));
    } catch (err) { alert("DELETE FAILED"); }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans p-6 selection:bg-emerald-500 selection:text-black">
      <header className="flex justify-between items-start mb-12 border-b border-zinc-900 pb-8">
        <div>
          <h1 className="text-2xl font-black italic text-emerald-500 uppercase tracking-tighter">Sandile SystemsWorks</h1>
          <p className="text-[9px] text-zinc-600 font-bold tracking-[0.3em] mt-1">LOGISTICS INTELLIGENCE UNIT</p>
          <nav className="flex gap-8 mt-6">
            <button onClick={() => setView('engine')} className={`text-[11px] uppercase font-bold tracking-widest ${view === 'engine' ? 'text-emerald-500 border-b border-emerald-500' : 'text-zinc-600 hover:text-zinc-400'}`}>The Engine</button>
            <button onClick={fetchHistory} className={`text-[11px] uppercase font-bold tracking-widest ${view === 'history' ? 'text-emerald-500 border-b border-emerald-500' : 'text-zinc-600 hover:text-zinc-400'}`}>Database History</button>
          </nav>
        </div>
        <div className="flex gap-4">
          <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
            <p className="text-[9px] text-zinc-500 uppercase font-bold mb-1 text-center">Fuel (R/L)</p>
            <input type="number" value={dieselPrice} onChange={(e) => setDieselPrice(e.target.value)} className="bg-transparent text-amber-500 font-mono text-xl w-20 outline-none text-center" />
          </div>
        </div>
      </header>

      {view === 'engine' ? (
        <main className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
          <section className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2rem]">
            <h2 className="text-[11px] font-bold uppercase text-zinc-500 mb-8 tracking-widest border-l-2 border-emerald-500 pl-4">Logistics Variable Input</h2>
            <div className="space-y-6">
              <div className="group">
                <label className="text-[9px] text-zinc-500 uppercase ml-2 italic text-emerald-500">Target Client / Company Name</label>
                <input type="text" placeholder="e.g. Richards Bay Transporters" className="w-full bg-zinc-950 border border-emerald-500/20 p-5 rounded-2xl outline-none focus:border-emerald-500 text-lg font-bold" value={inputs.companyName} onChange={(e) => setInputs({...inputs, companyName: e.target.value})} />
              </div>
              <div className="group">
                <label className="text-[9px] text-zinc-500 uppercase ml-2">Total Trip Distance (KM)</label>
                <input type="number" placeholder="0.00" className="w-full bg-zinc-950 border border-zinc-800 p-5 rounded-2xl outline-none focus:border-emerald-500 transition-all text-xl font-mono" onChange={(e) => setInputs({...inputs, distance: e.target.value})} />
              </div>
              <div className="group">
                <label className="text-[9px] text-zinc-500 uppercase ml-2">Client Offer Price (ZAR)</label>
                <input type="number" placeholder="0.00" className="w-full bg-zinc-950 border border-zinc-800 p-5 rounded-2xl outline-none focus:border-emerald-500 transition-all text-xl font-mono" onChange={(e) => setInputs({...inputs, clientOffer: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="group">
                  <label className="text-[9px] text-zinc-500 uppercase ml-2">Tolls</label>
                  <input type="number" placeholder="0" className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl outline-none focus:border-emerald-500" onChange={(e) => setInputs({...inputs, tolls: e.target.value})} />
                </div>
                <div className="group">
                  <label className="text-[9px] text-zinc-500 uppercase ml-2">Driver / Misc</label>
                  <input type="number" placeholder="0" className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl outline-none focus:border-emerald-500" onChange={(e) => setInputs({...inputs, driverFee: e.target.value})} />
                </div>
              </div>
            </div>
          </section>

          <section className={`p-10 rounded-[2rem] border-2 flex flex-col justify-between transition-all duration-700 shadow-2xl ${isRejected ? 'bg-red-950/5 border-red-500/20' : 'bg-emerald-950/5 border-emerald-500/20'}`}>
            <div>
               <div className="flex justify-between items-start mb-10">
                 <div>
                   <h3 className={`text-5xl font-black italic uppercase tracking-tighter ${isRejected ? 'text-red-500' : 'text-emerald-500'}`}>{isRejected ? 'Reject' : 'Accept'}</h3>
                   <p className="text-[10px] text-zinc-500 font-bold uppercase mt-2">Intelligence Verdict</p>
                 </div>
                 <div className="text-right">
                   <p className="text-4xl font-mono text-white">{calculation.margin.toFixed(1)}%</p>
                   <p className="text-[10px] text-zinc-500 font-bold uppercase">Net Margin</p>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800">
                    <p className="text-[9px] text-zinc-500 uppercase">Total Costs</p>
                    <p className="text-lg font-mono">R{Math.round(calculation.totalCost).toLocaleString()}</p>
                 </div>
                 <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800">
                    <p className="text-[9px] text-zinc-500 uppercase">Estimated Profit</p>
                    <p className={`text-lg font-mono ${calculation.profit > 0 ? 'text-emerald-400' : 'text-red-400'}`}>R{Math.round(calculation.profit).toLocaleString()}</p>
                 </div>
               </div>

               <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                 <p className="text-[10px] uppercase text-zinc-400 mb-1 font-bold">Negotiation Target (20% Profit)</p>
                 <p className="text-2xl text-emerald-400 font-mono">R{Math.round(calculation.recommendedPrice).toLocaleString()}</p>
               </div>
            </div>

            <div className="space-y-4 mt-12">
              <button onClick={saveDeal} disabled={isLoading} className="w-full bg-emerald-500 text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">Log to Secure Cloud</button>
              <button onClick={() => generateProfessionalPDF({...inputs, ...calculation, fuelPrice: dieselPrice, verdict: isRejected ? 'REJECT' : 'ACCEPT'})} className="w-full bg-zinc-800 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700 transition-all">Export Intelligence PDF</button>
            </div>
          </section>
        </main>
      ) : (
        <main className="max-w-6xl mx-auto animate-in zoom-in-95 duration-500">
          <div className="bg-zinc-950 border border-zinc-900 rounded-[2rem] overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-zinc-900 flex justify-between items-center">
                <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Shipment Archive {inputs.companyName && `- ${inputs.companyName}`}</h2>
                <button onClick={() => setInputs({...inputs, companyName: ''})} className="text-[10px] text-emerald-500 underline uppercase">Clear Filter</button>
            </div>
            <table className="w-full text-left">
              <thead className="bg-zinc-900/50 text-[10px] uppercase text-zinc-500 border-b border-zinc-900">
                <tr>
                  <th className="p-6">Client</th>
                  <th className="p-6">Trip (KM)</th>
                  <th className="p-6">Net Profit</th>
                  <th className="p-6">Margin</th>
                  <th className="p-6 text-right">Operational Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs font-mono">
                {savedDeals.map((deal) => (
                  <tr key={deal._id} className="border-b border-zinc-900/50 hover:bg-emerald-500/[0.02] transition-colors group">
                    <td className="p-6 text-zinc-400 font-bold uppercase">{deal.companyName || 'N/A'}</td>
                    <td className="p-6">{deal.distance} KM</td>
                    <td className={`p-6 ${deal.profit > 0 ? 'text-emerald-400 font-bold' : 'text-red-400'}`}>R{Math.round(deal.profit).toLocaleString()}</td>
                    <td className="p-6">{deal.margin?.toFixed(1)}%</td>
                    <td className="p-6 text-right space-x-6">
                      <button onClick={() => generateProfessionalPDF(deal)} className="text-emerald-500 hover:text-white transition-colors uppercase text-[10px] font-bold">PDF</button>
                      <button onClick={() => window.open(`/deal/${deal._id}`, '_blank')} className="text-zinc-400 hover:text-white transition-colors uppercase text-[10px] font-bold underline">Link</button>
                      <button onClick={() => deleteDeal(deal._id)} className="text-red-900 hover:text-red-500 transition-colors uppercase text-[10px] font-bold">Delete</button>
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

// In App.jsx, make sure the Router is clean:
const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<MainEngine />} />
      <Route path="deal/:id" element={<SharedDealPage />} /> 
    </Routes>
  </Router>
);

export default App;
