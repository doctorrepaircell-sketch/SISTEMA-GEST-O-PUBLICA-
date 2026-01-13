
import React, { useState, useEffect } from 'react';
import { Person } from '../types';
import { getFamilyInsights } from '../services/geminiService';

interface DashboardHomeProps {
  residents: Person[];
  onAction: (tab: 'residents' | 'reports' | 'agents' | 'backups', openForm?: boolean) => void;
  agentName: string;
  isAdmin: boolean;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ residents, onAction, agentName, isAdmin }) => {
  const [insights, setInsights] = useState<{title: string, content: string, category: string}[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [showBackupReminder, setShowBackupReminder] = useState(false);

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      if (now.getHours() >= 16) {
        setShowBackupReminder(true);
      }
    };
    checkTime();
    const timer = setInterval(checkTime, 60000 * 15);
    return () => clearInterval(timer);
  }, []);

  const total = residents.length;
  const students = residents.filter(r => r.education?.isStudying).length;
  const heads = residents.filter(r => r.relationship === 'Titular').length;
  
  const getAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const minors = residents.filter(r => getAge(r.birthDate) < 18).length;

  useEffect(() => {
    const fetchInsights = async () => {
      if (residents.length > 0 && insights.length === 0) {
        setIsLoadingInsights(true);
        // Pega uma amostra representativa (Titulares + alguns dependentes)
        const sample = residents.slice(0, 15);
        const result = await getFamilyInsights(sample);
        if (result && result.length > 0) {
          setInsights(result);
        }
        setIsLoadingInsights(false);
      }
    };
    fetchInsights();
  }, [residents]);

  const StatCard = ({ label, value, color, icon, trend }: { label: string, value: number | string, color: string, icon: React.ReactNode, trend?: string }) => (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-500 group relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 group-hover:opacity-10 transition-opacity translate-x-10 -translate-y-10 ${color}`}>
        {icon}
      </div>
      <div className="relative z-10">
        <div className={`w-14 h-14 ${color.replace('text-', 'bg-').replace('600', '50')} ${color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">{label}</span>
        <div className="flex items-end gap-3">
          <span className="text-4xl font-black text-slate-900 tracking-tighter">{value}</span>
          {trend && <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg mb-1">{trend}</span>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {showBackupReminder && (
        <div className="bg-amber-600 text-white px-10 py-6 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-500 border-b-4 border-amber-700">
           <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center animate-bounce">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <div>
                <h4 className="text-lg font-black uppercase tracking-tighter">Final de Expediente Detectado</h4>
                <p className="text-amber-100 text-xs font-bold uppercase tracking-widest mt-1 opacity-80">Realize o backup institucional antes de encerrar o sistema hoje.</p>
              </div>
           </div>
           <button 
             onClick={() => onAction('backups')}
             className="bg-white text-amber-600 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-amber-50 transition-all shadow-xl whitespace-nowrap"
           >
             Ir para Redundância
           </button>
        </div>
      )}

      <div className="relative overflow-hidden bg-slate-950 rounded-[3.5rem] p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full -mr-48 -mt-48 blur-[100px]"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="max-w-2xl text-center md:text-left">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4 block">Central de Inteligência</span>
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter leading-none">Agente Público <br/><span className="text-indigo-500">{agentName.split(' ')[0]}</span></h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-lg">
              Monitorando {total} cidadãos cadastrados no banco de dados territorial.
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[3rem] flex flex-col items-center justify-center min-w-[260px] shadow-2xl">
             <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center mb-4 shadow-xl">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
             </div>
             <span className="text-6xl font-black text-white">{total}</span>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mt-2">Cidadãos Totais</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Núcleos Familiares" value={heads} color="text-indigo-600" icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>} trend={`${Math.round(total > 0 ? (heads/total)*100 : 0)}%`} />
        <StatCard label="Educação Ativa" value={students} color="text-amber-600" icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>} trend={`${Math.round(total > 0 ? (students/total)*100 : 0)}%`} />
        <StatCard label="Infância e Juventude" value={minors} color="text-emerald-600" icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} trend={`${Math.round(total > 0 ? (minors/total)*100 : 0)}%`} />
        <StatCard label="Bairros Ativos" value={new Set(residents.filter(r => r.neighborhood).map(r => r.neighborhood)).size} color="text-blue-600" icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-white border border-slate-200 p-10 rounded-[3rem] shadow-sm flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
               </div>
               <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Insights do Território (AI)</h3>
            </div>
            {isLoadingInsights && <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            {insights.length > 0 ? insights.map((insight, idx) => (
              <div key={idx} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 hover:border-indigo-200 transition-all group animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${idx * 150}ms` }}>
                <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest block mb-2">{insight.category}</span>
                <h4 className="text-sm font-black text-slate-900 uppercase mb-3 leading-tight">{insight.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{insight.content}</p>
              </div>
            )) : (
              <div className="col-span-2 flex flex-col items-center justify-center py-12 text-center opacity-40">
                 <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                 </div>
                 <p className="text-xs font-black uppercase tracking-widest max-w-[240px]">
                   {total > 0 ? "O Gemini está processando dados demográficos..." : "Aguardando cadastro de moradores para gerar insights."}
                 </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-indigo-600 p-10 rounded-[3rem] text-white shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="relative z-10">
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">Ações do Dia</h3>
            <p className="text-indigo-100 text-sm font-medium leading-relaxed mb-10">
              Gerencie cadastros, emita analíticos ou mapeie novos logradouros em tempo real.
            </p>
            <div className="space-y-4">
               <button onClick={() => onAction('residents', true)} className="w-full bg-white text-indigo-600 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-indigo-50 transition-all active:scale-95">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                  Novo Cadastro
               </button>
               <button onClick={() => onAction('reports')} className="w-full bg-indigo-500/50 border border-white/20 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all flex items-center justify-center gap-3 active:scale-95">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 17v-2m3 2v-4m3 2v-6m-8 13h10a2 2 0 002-2V5a2 2 0 00-2-2H9a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  Ver Relatórios
               </button>
            </div>
          </div>
          <div className="relative z-10 pt-10">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Portal de Gestão Municipal • {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
