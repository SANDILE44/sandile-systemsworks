import React, { useState, useMemo, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_BASE_URL = "https://systems-j894.onrender.com";

// --- THE ENGINE: PDF GENERATOR ---
const generateProfessionalPDF = (deal) => {
  try {
    const doc = new jsPDF();
    const company = (deal.companyName || "INTERNAL").toUpperCase();
    const isGoodDeal = (deal.margin || 0) >= 15;
    const accentColor = isGoodDeal ? [16, 185, 129] : [239, 68, 68];

    // Header Tech-Bar
    doc.setFillColor(30, 30, 30);
    doc.rect(0, 0, 210, 50, 'F');
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.rect(0, 45, 210, 5, 'F'); 

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("SYSTEMSWORKS INTELLIGENCE", 14, 25);
    
    doc.setFontSize(10);
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text(`PROJECT STATUS: ${isGoodDeal ? 'OPTIMIZED / ACCEPT' : 'HIGH RISK / REJECT'}`, 14, 35);
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

// --- VIEW: SECURE SHARED NODE ---
const SharedDealPage = () => {
  const { id } = useParams();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scramble, setScramble] = useState("DECRYPTING...");

useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/deals/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("DEAL_NOT_FOUND");
        return res.json();
      })
      .then(data => { 
        setDeal(data); 
        // Small delay to make the "Establishing Link" animation look intentional
        setTimeout(() => setLoading(false), 800); 
      })
      .catch(err => {
        console.error("DECRYPTION_FAILURE:", err);
        alert("CRITICAL_ERROR: Link is invalid or record has been purged.");
        window.location.href = "/#/"; // Send them back to safety
      });
}, [id]);

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-emerald-500 font-mono tracking-widest animate-pulse uppercase">Establishing Secure Link...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 to-black text-white p-6 flex items-center justify-center">
      <div className="max-w-xl w-full bg-zinc-950 border border-emerald-500/30 p-1 rounded-3xl shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)]">
        <div className="bg-black p-8 rounded-3xl border border-zinc-800">
            <div className="flex justify-between items-start mb-12">
                <div className="group">
                    <h1 className="text-emerald-500 font-black text-xl italic tracking-tighter">SANDILE SYSTEMSWORKS</h1>
                    <div className="h-1 w-0 group-hover:w-full bg-emerald-500 transition-all duration-500"></div>
                </div>
                <div className="text-right">
                    <p className="text-[8px] text-zinc-500 uppercase tracking-widest">Node_Auth</p>
                    <p className="text-[10px] text-emerald-400 font-mono">VERIFIED_CLIENT</p>
                </div>
            </div>

            <div className="space-y-8">
                <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                    <p className="text-zinc-500 text-[10px] uppercase font-bold mb-1">Projected Net Gain</p>
                    <p className="text-5xl font-black text-white font-mono">
    R {deal?.profit ? Math.round(deal.profit).toLocaleString() : '0'}
</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="border border-zinc-800 p-4 rounded-xl">
                        <p className="text-zinc-500 text-[9px] uppercase">Margin</p>
                        <p className="text-xl font-bold text-emerald-500">{deal.margin?.toFixed(1)}%</p>
                    </div>
                    <div className="border border-zinc-800 p-4 rounded-xl">
                        <p className="text-zinc-500 text-[9px] uppercase">ROI Status</p>
                        <p className={`text-xl font-bold ${deal.margin >= 15 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {deal.margin >= 15 ? 'OPTIMIZED' : 'SUB-PAR'}
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
  const [view, setView] = useState('engine'); 
  const [savedDeals, setSavedDeals] = useState([]);
  const [inputs, setInputs] = useState({ distance: '', clientOffer: '', tolls: '', driverFee: '', companyName: '' });
  const [dieselPrice, setDieselPrice] = useState(25.50); 
  const [isLoading, setIsLoading] = useState(false);

  // Background fetch for stats only
  const silentFetch = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/deals`);
      const data = await res.json();
      setSavedDeals(Array.isArray(data) ? data : []);
    } catch (e) {}
  };

  useEffect(() => { silentFetch(); }, []);

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
    if(!inputs.companyName) return alert("REQUIRED: PROJECT_ID / COMPANY_NAME");
    setIsLoading(true);
    const payload = { ...inputs, fuelPrice: dieselPrice, ...calculation, verdict: isRejected ? 'REJECT' : 'ACCEPT' };
    try {
      const res = await fetch(`${API_BASE_URL}/api/deals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("CLOUD SYNCHRONIZATION COMPLETE");
        silentFetch();
      }
    } catch (err) { alert("NETWORK FAILURE"); }
    finally { setIsLoading(false); }
  };

  // --- DELETE BUTTON ---
  const deleteDeal = async (id) => {
    if (!window.confirm("CRITICAL: Erase this record from the Cloud Archive permanently?")) return;
    
    setIsLoading(true);
    try {
        const res = await fetch(`${API_BASE_URL}/api/deals/${id}`, { 
            method: 'DELETE' 
        });

        if (res.ok) {
            // Instantly update the UI by filtering out the deleted ID
            setSavedDeals(prev => prev.filter(deal => deal._id !== id));
            alert("RECORD PURGED FROM CLOUD");
        } else {
            const errorData = await res.json();
            alert(`SERVER ERROR: ${errorData.error}`);
        }
    } catch (err) {
        console.error("DELETE_ERROR:", err);
        alert("NETWORK FAILURE: UNABLE TO REACH CLOUD");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500">
      {/* HUD Header */}
      <nav className="border-b border-zinc-800 p-6 flex flex-col md:flex-row justify-between items-center gap-6 sticky top-0 bg-black/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center font-black text-black italic text-xl shadow-[0_0_15px_rgba(16,185,129,0.4)]">SS</div>
            <div>
                <h1 className="text-xl font-black tracking-tighter uppercase italic">Sandile SystemsWorks</h1>
                <p className="text-[8px] text-zinc-500 font-bold tracking-[.4em]">LOGISTICS_OPERATIONS_AI</p>
            </div>
        </div>
        
        <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button onClick={() => setView('engine')} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${view === 'engine' ? 'bg-emerald-500 text-black' : 'text-zinc-500 hover:text-white'}`}>Engine</button>
            <button onClick={() => setView('history')} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${view === 'history' ? 'bg-emerald-500 text-black' : 'text-zinc-500 hover:text-white'}`}>Archive</button>
        </div>
      </nav>

      <div className="p-6 md:p-12 max-w-7xl mx-auto">
      {view === 'engine' ? (
        <div className="grid lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Inputs */}
          <div className="space-y-6">
            <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-[2.5rem]">
              <h2 className="text-emerald-500 text-xs font-bold uppercase tracking-widest mb-8 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Data Entry Console
              </h2>
              <div className="grid gap-6">
                <div className="relative group">
                    <input type="text" placeholder="COMPANY NAME / ID" className="w-full bg-black border-2 border-zinc-800 p-5 rounded-2xl outline-none focus:border-emerald-500 transition-all font-bold tracking-widest placeholder:text-zinc-700 uppercase" value={inputs.companyName} onChange={e => setInputs({...inputs, companyName: e.target.value})}/>
                    <span className="absolute right-4 top-5 text-[8px] text-zinc-600 font-mono italic opacity-0 group-focus-within:opacity-100 transition-opacity">PROJ_ID_REQUIRED</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 ml-2">DISTANCE (KM)</label>
                        <input type="number" className="w-full bg-black border border-zinc-800 p-4 rounded-xl outline-none focus:border-emerald-500 font-mono" placeholder="0" onChange={e => setInputs({...inputs, distance: e.target.value})}/>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 ml-2">OFFER (ZAR)</label>
                        <input type="number" className="w-full bg-black border border-zinc-800 p-4 rounded-xl outline-none focus:border-emerald-500 font-mono text-emerald-500" placeholder="0.00" onChange={e => setInputs({...inputs, clientOffer: e.target.value})}/>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <input type="number" placeholder="TOLLS" className="bg-black border border-zinc-800 p-4 rounded-xl outline-none focus:border-emerald-500 font-mono" onChange={e => setInputs({...inputs, tolls: e.target.value})}/>
                    <input type="number" placeholder="DRIVER FEE" className="bg-black border border-zinc-800 p-4 rounded-xl outline-none focus:border-emerald-500 font-mono" onChange={e => setInputs({...inputs, driverFee: e.target.value})}/>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-[2rem] flex justify-between items-center">
                <div>
                    <p className="text-[9px] text-zinc-500 uppercase font-bold">Variable Fuel Rate</p>
                    <p className="text-xs text-amber-500/50 italic">Market Adjuster</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-amber-500 font-mono text-sm">R</span>
                    <input type="number" value={dieselPrice} onChange={e => setDieselPrice(e.target.value)} className="bg-black border border-amber-500/30 text-amber-500 font-mono text-xl w-24 p-2 rounded-lg text-center outline-none focus:border-amber-500 transition-all"/>
                </div>
            </div>
          </div>

          {/* Real-time Results */}
          <div className={`relative p-10 rounded-[3rem] border-2 transition-all duration-700 overflow-hidden shadow-2xl ${isRejected ? 'bg-red-500/[0.03] border-red-500/20' : 'bg-emerald-500/[0.03] border-emerald-500/40'}`}>
            {/* Background Glow */}
            <div className={`absolute -top-24 -right-24 w-64 h-64 blur-[100px] rounded-full transition-colors duration-1000 ${isRejected ? 'bg-red-500/10' : 'bg-emerald-500/20'}`}></div>
            
            <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className={`text-6xl font-black italic tracking-tighter transition-colors ${isRejected ? 'text-red-500' : 'text-emerald-500'}`}>
                            {isRejected ? 'REJECT' : 'ACCEPT'}
                        </h3>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-2">Intelligence Verdict</p>
                    </div>
                    <div className="text-right">
                        <p className={`text-4xl font-mono ${isRejected ? 'text-red-400' : 'text-emerald-400'}`}>{calculation.margin.toFixed(1)}%</p>
                        <p className="text-[10px] text-zinc-500 uppercase font-bold">Net Efficiency</p>
                    </div>
                </div>

                <div className="mt-12 space-y-4">
                    <div className="bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 flex justify-between items-center">
                        <span className="text-zinc-500 text-xs font-bold">ESTIMATED PROFIT</span>
                        <span className={`text-2xl font-mono font-bold ${calculation.profit > 0 ? 'text-emerald-400' : 'text-red-500'}`}>R {Math.round(calculation.profit).toLocaleString()}</span>
                    </div>
                    <div className="bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 flex justify-between items-center">
                        <span className="text-zinc-500 text-xs font-bold">OPERATING COSTS</span>
                        <span className="text-xl font-mono text-zinc-300">R {Math.round(calculation.totalCost).toLocaleString()}</span>
                    </div>
                    <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-2xl">
                        <p className="text-[10px] text-emerald-500 font-black uppercase mb-1">Target Price (20% Efficiency)</p>
                        <p className="text-3xl font-mono text-emerald-400 italic">R {Math.round(calculation.recommendedPrice).toLocaleString()}</p>
                    </div>
                </div>

                <div className="mt-auto pt-12 space-y-4">
                    <button onClick={saveDeal} disabled={isLoading} className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 text-black font-black py-5 rounded-2xl uppercase tracking-[0.3em] shadow-[0_10px_30px_-10px_rgba(16,185,129,0.5)] transition-all active:scale-95">
                        {isLoading ? 'SYNCING...' : 'Log to Secure Cloud'}
                    </button>
                    <button onClick={() => generateProfessionalPDF({...inputs, ...calculation, fuelPrice: dieselPrice})} className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-4 rounded-2xl text-[10px] uppercase tracking-widest border border-zinc-800 transition-all">
                        Export Intelligence PDF
                    </button>
                </div>
            </div>
          </div>
        </div>
      ) : (
        /* ARCHIVE VIEW */
        <div className="animate-in zoom-in-95 duration-500 bg-zinc-950 border border-zinc-900 rounded-[3rem] overflow-hidden shadow-2xl">
            <div className="p-10 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/20">
                <div>
                    <h2 className="text-xl font-black italic text-zinc-400">CLOUD ARCHIVE</h2>
                    <p className="text-[9px] text-emerald-500 font-mono uppercase tracking-[0.3em]">Historical Node Data</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-mono text-white">R {Math.round(savedDeals.reduce((a,b)=>a+(b.profit||0),0)).toLocaleString()}</p>
                    <p className="text-[8px] text-zinc-600 font-bold uppercase">Global Profit Accumulation</p>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead className="bg-black text-[9px] uppercase text-zinc-500 tracking-widest">
                        <tr>
                            <th className="p-8 text-left">Client Identity</th>
                            <th className="p-8 text-left">Metrics</th>
                            <th className="p-8 text-left">Profitability</th>
                            <th className="p-8 text-right">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="font-mono text-xs">
                        {savedDeals.map((deal) => (
                            <tr key={deal._id} className="border-b border-zinc-900 hover:bg-emerald-500/[0.02] transition-colors group">
                                <td className="p-8">
                                    <p className="text-white font-black uppercase text-sm">{deal.companyName}</p>
                                    <p className="text-zinc-600 text-[9px] mt-1 italic">ID: {deal._id?.slice(-8)}</p>
                                </td>
                                <td className="p-8">
                                    <div className="flex gap-4">
                                        <span className="text-zinc-400">{deal.distance} KM</span>
                                        <span className={`px-2 rounded ${deal.margin >= 15 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>{deal.margin?.toFixed(1)}%</span>
                                    </div>
                                </td>
                                <td className={`p-8 text-lg font-bold ${deal.profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                    R {Math.round(deal.profit).toLocaleString()}
                                </td>
                                <td className="p-8 text-right space-x-6">
                                    <button onClick={() => generateProfessionalPDF(deal)} className="text-zinc-500 hover:text-emerald-500 transition-colors uppercase font-black text-[10px]">PDF</button>
                                    <button 
  onClick={() => {
    // This ensures we get the correct base path regardless of where it's hosted
    const shareUrl = `${window.location.origin}${window.location.pathname}#/deal/${deal._id}`;
    window.open(shareUrl, '_blank');
  }} 
  className="text-zinc-500 hover:text-white underline transition-colors uppercase font-black text-[10px]"
>
  Share
</button>
                                  <button 
    onClick={() => deleteDeal(deal._id)} 
    className="text-red-900 hover:text-red-500 font-black text-[10px] uppercase transition-colors"
>
    Delete
</button>
                                </td>
                            </tr>
                        ))}
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
