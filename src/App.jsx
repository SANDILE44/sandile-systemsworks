import React, { useState, useMemo, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// --- CONFIGURATION ---
// I replaced localhost with your Render URL
const API_BASE_URL = "https://systems-j894.onrender.com";

const App = () => {
  const [view, setView] = useState('engine'); 
  const [savedDeals, setSavedDeals] = useState([]);
  const [inputs, setInputs] = useState({ distance: '', clientOffer: '', tolls: '', driverFee: '' });
  const [dieselPrice, setDieselPrice] = useState(30.85);
  const [isLoading, setIsLoading] = useState(false);

  const TRUCK_CONSUMPTION = 2.5; 
  const OPERATIONAL_COST_PER_KM = 8.50;

  // --- CALCULATE TOTAL PROFIT FOR HISTORY ---
const totalLifetimeProfit = useMemo(() => {
  // Add "Array.isArray" check to prevent the crash
  if (!Array.isArray(savedDeals)) return 0; 
  return savedDeals.reduce((sum, deal) => sum + (deal.profit || 0), 0);
}, [savedDeals]);
  

  // --- PDF GENERATOR ---
  const generatePDF = (dealData) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("SANDILE SYSTEMSWORKS", 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Logistics Intelligence Report | Richards Bay Sector", 14, 30);
    
    const tableData = [
      ["Metric", "Value"],
      ["Distance", `${dealData.distance} KM`],
      ["Client Offer", `R ${dealData.clientOffer}`],
      ["Fuel Price", `R ${dealData.fuelPrice}/L`],
      ["Total Trip Cost", `R ${Math.round(dealData.totalCost)}`],
      ["Net Profit", `R ${Math.round(dealData.profit)}`],
      ["Margin", `${dealData.margin ? dealData.margin.toFixed(1) : 0}%`],
      ["Verdict", dealData.verdict]
    ];

    doc.autoTable({
      startY: 40,
      head: [['Logistics Analysis', 'Details']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] }
    });

    doc.save(`Deal_Report_${new Date().getTime()}.pdf`);
  };

  // --- SHARE FUNCTION ---
  const shareDeal = async (deal) => {
    const text = `Logistics Deal: ${deal.distance}KM | Profit: R${Math.round(deal.profit)} | Margin: ${deal.margin.toFixed(1)}% | Verdict: ${deal.verdict}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Sandile SystemsWorks Deal', text: text, url: window.location.href });
      } catch (err) { console.log("Share failed"); }
    } else {
      navigator.clipboard.writeText(text);
      alert("Deal summary copied to clipboard!");
    }
  };

  // --- LOGIC & DB ---
  const calculation = useMemo(() => {
    const dist = parseFloat(inputs.distance) || 0;
    const offer = parseFloat(inputs.clientOffer) || 0;
    const totalCost = ((dist / TRUCK_CONSUMPTION) * dieselPrice) + (dist * OPERATIONAL_COST_PER_KM) + (parseFloat(inputs.tolls) || 0) + (parseFloat(inputs.driverFee) || 0);
    const profit = offer - totalCost;
    const margin = offer > 0 ? (profit / offer) * 100 : 0;
    return { totalCost, profit, margin };
  }, [inputs, dieselPrice]);

  const isRejected = calculation.margin < 15;

  const saveDeal = async () => {
    setIsLoading(true);
    const payload = { ...inputs, fuelPrice: dieselPrice, ...calculation, verdict: isRejected ? 'REJECT' : 'ACCEPT' };
    try {
      const res = await fetch(`${API_BASE_URL}/api/deals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) alert("✅ LOGGED TO CLOUD DATABASE");
    } catch (err) { 
      alert("❌ CLOUD OFFLINE: Check Render logs"); 
    } finally {
      setIsLoading(false);
    }
  };

const fetchHistory = async () => {
  setIsLoading(true);
  try {
    const res = await fetch(`${API_BASE_URL}/api/deals`);
    
    if (!res.ok) throw new Error("Server Error"); // Catch the 500 error

    const data = await res.json();
    
    // Ensure we only set data if it's actually an array
    setSavedDeals(Array.isArray(data) ? data : []);
    setView('history');
  } catch (err) { 
    console.error("Fetch error:", err);
    alert("Database unreachable or Server Error!"); 
    setSavedDeals([]); // Set to empty array so the app doesn't crash
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-black text-white font-sans p-6">
      <header className="flex justify-between items-center mb-12 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tighter text-emerald-500 uppercase italic">Sandile SystemsWorks</h1>
          <nav className="flex gap-6 mt-4">
            <button onClick={() => setView('engine')} className={`text-xs uppercase tracking-[0.2em] font-bold ${view === 'engine' ? 'text-white' : 'text-zinc-600'}`}>Engine</button>
            <button onClick={fetchHistory} className={`text-xs uppercase tracking-[0.2em] font-bold ${view === 'history' ? 'text-white' : 'text-zinc-600'}`}>History</button>
          </nav>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Diesel Price</p>
          <p className="text-2xl font-mono text-amber-400 font-bold">R{dieselPrice.toFixed(2)}/L</p>
        </div>
      </header>

      {view === 'engine' ? (
        <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl">
            <h2 className="text-sm font-bold uppercase text-zinc-500 mb-6">Input Matrix</h2>
            <div className="space-y-6">
              <input type="number" placeholder="Distance (KM)" className="w-full bg-black border border-zinc-700 p-4 rounded-xl focus:border-emerald-500 outline-none" onChange={(e) => setInputs({...inputs, distance: e.target.value})} />
              <input type="number" placeholder="Offer (ZAR)" className="w-full bg-black border border-zinc-700 p-4 rounded-xl focus:border-emerald-500 outline-none" onChange={(e) => setInputs({...inputs, clientOffer: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Tolls" className="bg-black border border-zinc-700 p-4 rounded-xl" onChange={(e) => setInputs({...inputs, tolls: e.target.value})} />
                <input type="number" placeholder="Driver Fee" className="bg-black border border-zinc-700 p-4 rounded-xl" onChange={(e) => setInputs({...inputs, driverFee: e.target.value})} />
              </div>
            </div>
          </section>

          <section className={`p-8 rounded-2xl border flex flex-col justify-between transition-all duration-500 ${isRejected ? 'bg-red-950/20 border-red-500' : 'bg-emerald-950/20 border-emerald-500'}`}>
            <div className="text-center">
              <h3 className={`text-7xl font-black italic uppercase ${isRejected ? 'text-red-500' : 'text-emerald-500'}`}>{isRejected ? 'Reject' : 'Accept'}</h3>
              <p className="text-sm mt-2 opacity-70 italic">Calculated Margin: {calculation.margin.toFixed(1)}%</p>
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={saveDeal} 
                disabled={isLoading}
                className="w-full bg-emerald-500 text-black py-4 rounded-xl font-bold hover:bg-emerald-400 transition disabled:opacity-50"
              >
                {isLoading ? "SYNCING..." : "LOG TO CLOUD"}
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => generatePDF({...inputs, ...calculation, fuelPrice: dieselPrice, verdict: isRejected ? 'REJECT' : 'ACCEPT'})} className="bg-zinc-800 text-white py-3 rounded-xl text-xs font-bold uppercase hover:bg-zinc-700 transition">Export PDF</button>
                <button onClick={() => shareDeal({...inputs, ...calculation, verdict: isRejected ? 'REJECT' : 'ACCEPT'})} className="bg-zinc-800 text-white py-3 rounded-xl text-xs font-bold uppercase hover:bg-zinc-700 transition">Share Deal</button>
              </div>
            </div>

            <div className="flex justify-between pt-6 border-t border-white/10 mt-6 font-mono text-xs">
               <div className="text-left">
                  <p className="text-zinc-500 uppercase">Est. Cost</p>
                  <p className="text-lg">R{Math.round(calculation.totalCost).toLocaleString()}</p>
               </div>
               <div className="text-right">
                  <p className="text-zinc-500 uppercase">Net Profit</p>
                  <p className={`text-lg font-bold ${calculation.profit > 0 ? 'text-emerald-400' : 'text-red-500'}`}>R{Math.round(calculation.profit).toLocaleString()}</p>
               </div>
            </div>
          </section>
        </main>
      ) : (
        <main className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-bold italic text-emerald-500 uppercase">Operations History</h2>
              <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest">Cloud Database Sync: Active</p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-right">
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Lifetime Managed Profit</p>
              <p className="text-2xl font-mono text-emerald-500 font-bold">R{Math.round(totalLifetimeProfit).toLocaleString()}</p>
            </div>
          </div>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-800/50 text-[10px] uppercase tracking-widest text-zinc-500">
                  <th className="p-6">Date</th>
                  <th className="p-6">Distance</th>
                  <th className="p-6">Profit</th>
                  <th className="p-6">Margin</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm font-mono">
                {savedDeals.length === 0 ? (
                  <tr><td colSpan="5" className="p-20 text-center text-zinc-600 uppercase tracking-widest">No Cloud Data Found</td></tr>
                ) : (
                  savedDeals.map((deal, i) => (
                    <tr key={i} className="border-t border-zinc-800 hover:bg-white/5 transition">
                      <td className="p-6 text-zinc-500">{new Date(deal.createdAt).toLocaleDateString()}</td>
                      <td className="p-6 font-bold">{deal.distance} KM</td>
                      <td className={`p-6 ${deal.profit > 0 ? 'text-emerald-500' : 'text-red-500'}`}>R{Math.round(deal.profit).toLocaleString()}</td>
                      <td className="p-6 italic">{deal.margin ? deal.margin.toFixed(1) : 0}%</td>
                      <td className="p-6 text-right space-x-4">
                        <button onClick={() => generatePDF(deal)} className="text-emerald-500 hover:underline text-[10px] uppercase font-bold">PDF</button>
                        <button onClick={() => shareDeal(deal)} className="text-zinc-400 hover:underline text-[10px] uppercase font-bold">Share</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      )}

      <footer className="mt-24 text-center">
        <p className="text-[10px] tracking-[0.4em] text-zinc-700 uppercase font-bold">Automated Logic by Sandile SystemsWorks • Richards Bay, ZA</p>
      </footer>
    </div>
  );
};

export default App;