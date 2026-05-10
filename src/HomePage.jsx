import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* --- NAVIGATION --- */}
      <nav className="p-6 flex justify-between items-center border-b border-zinc-900 sticky top-0 bg-black/50 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="w-8 h-8" />
          <span className="font-black tracking-tighter uppercase text-xl">SystemsWorks</span>
        </div>
        <div className="flex gap-4">
          <button onClick={() => navigate('/login')} className="text-xs font-bold uppercase tracking-widest hover:text-emerald-500 transition-colors">Login</button>
          <button onClick={() => navigate('/register')} className="bg-emerald-500 text-black px-4 py-2 rounded-lg text-xs font-black uppercase">Get Started</button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="py-24 px-6 text-center">
        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-6 italic">
          Logistics <span className="text-emerald-500 text-outline">Intelligence</span>
        </h1>
        <p className="max-w-2xl mx-auto text-zinc-500 text-sm md:text-base leading-relaxed mb-10 uppercase tracking-widest font-mono">
          Precision logic engines for modern freight management and profit optimization.
        </p>
        <button onClick={() => navigate('/register')} className="bg-white text-black px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-500 transition-all active:scale-95">
          Initialize System
        </button>
      </section>

      {/* --- SERVICES SECTION --- */}
      <section className="py-20 px-6 max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-[2rem] hover:border-emerald-500/50 transition-colors">
          <div className="text-emerald-500 font-mono mb-4 text-xs tracking-widest">[01]</div>
          <h3 className="font-black uppercase mb-2">Profit Engine</h3>
          <p className="text-zinc-500 text-xs leading-loose">Automated margin calculations and risk monitoring for every load.</p>
        </div>
        <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-[2rem] hover:border-emerald-500/50 transition-colors">
          <div className="text-emerald-500 font-mono mb-4 text-xs tracking-widest">[02]</div>
          <h3 className="font-black uppercase mb-2">Cloud Archive</h3>
          <p className="text-zinc-500 text-xs leading-loose">Secure storage of all business operations and deal history.</p>
        </div>
        <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-[2rem] hover:border-emerald-500/50 transition-colors">
          <div className="text-emerald-500 font-mono mb-4 text-xs tracking-widest">[03]</div>
          <h3 className="font-black uppercase mb-2">Shareable Intel</h3>
          <p className="text-zinc-500 text-xs leading-loose">Generate encrypted links to share professional PDF reports instantly.</p>
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section className="py-24 px-6 text-center bg-zinc-950/50">
        <h2 className="text-3xl font-black uppercase italic mb-12">System Tiers</h2>
        <div className="max-w-md mx-auto bg-black border-2 border-emerald-500/20 p-10 rounded-[3rem] shadow-[0_0_50px_-10px_rgba(16,185,129,0.1)]">
          <p className="text-emerald-500 font-black text-xs uppercase tracking-[0.3em] mb-4">Enterprise Access</p>
          <p className="text-5xl font-black mb-6">R 1,200<span className="text-sm text-zinc-500">/mo</span></p>
          <ul className="text-left space-y-4 mb-10 text-zinc-400 text-xs font-mono">
            <li>+ Unlimited Logic Calculations</li>
            <li>+ Advanced PDF Generation</li>
            <li>+ 24/7 Node Support</li>
            <li>+ Real-time Risk Monitoring</li>
          </ul>
          <button onClick={() => navigate('/register')} className="w-full bg-emerald-500 text-black font-black py-4 rounded-xl uppercase tracking-widest">
            Select Plan
          </button>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="p-12 text-center border-t border-zinc-900">
        <p className="text-zinc-700 text-[10px] font-bold tracking-[0.5em] uppercase">
          SystemsWorks © 2026 // Distributed Operations
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
