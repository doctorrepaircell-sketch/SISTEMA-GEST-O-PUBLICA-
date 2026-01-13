
import React, { useState, useRef } from 'react';
import { Agent, AgentRole, Institution, SystemMode } from '../types';

interface SetupWizardProps {
  onComplete: (institution: Institution, agent: Agent) => void;
}

const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [instData, setInstData] = useState<Institution>({
    name: '',
    cnpj: '',
    city: '',
    logoUrl: 'https://placehold.co/100x100/2563eb/white?text=LOGO',
    systemMode: SystemMode.STATION,
    developerName: '',
    developerContact: ''
  });

  const [agentData, setAgentData] = useState<Agent>({
    id: Math.random().toString(36).substr(2, 9),
    name: '',
    cpf: '',
    email: '',
    username: '',
    password: '',
    avatarUrl: '',
    role: AgentRole.ADMIN
  });

  const [showPassword, setShowPassword] = useState(false);
  const instLogoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInstLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setInstData(prev => ({ ...prev, logoUrl: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleAgentAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAgentData(prev => ({ ...prev, avatarUrl: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(instData, agentData);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-slate-900">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-[40px] shadow-2xl overflow-hidden min-h-[600px]">
        
        {/* Lado Esquerdo: Info e Progresso */}
        <div className="lg:col-span-4 bg-blue-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-black leading-tight mb-8 uppercase tracking-tighter">
              Instalação <br />
              <span className="text-blue-200">do Sistema</span>
            </h1>
            
            <div className="space-y-6">
              {[
                { s: 0, l: "Modo de Operação" },
                { s: 1, l: "Instituição" },
                { s: 2, l: "Agente Master" },
                { s: 3, l: "Desenvolvedor" }
              ].map((item) => (
                <div key={item.s} className={`flex items-center gap-4 transition-opacity ${step === item.s ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-black ${step === item.s ? 'bg-white text-blue-600' : 'border-white'}`}>{item.s}</div>
                  <span className="font-black uppercase text-[10px] tracking-widest">{item.l}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 pt-12 border-t border-white/10">
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-blue-300">Gestão Pública Inteligente</p>
          </div>
        </div>

        {/* Lado Direito: Formulários */}
        <div className="lg:col-span-8 p-12 overflow-y-auto max-h-screen">
          {step === 0 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 h-full flex flex-col">
              <header className="mb-10">
                <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Tipo de Instalação</h2>
                <p className="text-slate-500 font-medium mt-2">Como este dispositivo irá operar na rede?</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                <button 
                  onClick={() => { setInstData({...instData, systemMode: SystemMode.SERVER}); setStep(1); }}
                  className="p-8 border-4 border-slate-100 rounded-[3rem] hover:border-indigo-600 hover:bg-indigo-50/50 transition-all text-left group"
                >
                  <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 uppercase">Módulo Servidor</h3>
                  <p className="text-sm text-slate-500 mt-4 leading-relaxed">
                    Painel Central. Reúne todos os dados, gera analíticos completos e unifica o banco de dados.
                  </p>
                  <span className="inline-block mt-6 text-[10px] font-black text-indigo-600 uppercase tracking-widest">Recomendado para Sede</span>
                </button>

                <button 
                  onClick={() => { setInstData({...instData, systemMode: SystemMode.STATION}); setStep(1); }}
                  className="p-8 border-4 border-slate-100 rounded-[3rem] hover:border-blue-600 hover:bg-blue-50/50 transition-all text-left group"
                >
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 uppercase">Estação de Coleta</h3>
                  <p className="text-sm text-slate-500 mt-4 leading-relaxed">
                    Focado em entrada de dados. Para uso em dispositivos móveis e agentes em campo.
                  </p>
                  <span className="inline-block mt-6 text-[10px] font-black text-blue-600 uppercase tracking-widest">Recomendado para Campo</span>
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <header className="mb-10">
                <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Dados da Instituição</h2>
                <p className="text-slate-500 font-medium mt-2">Identifique a prefeitura ou órgão público responsável.</p>
              </header>

              <div className="space-y-6">
                <div className="flex flex-col items-center mb-8">
                  <div className="relative group cursor-pointer" onClick={() => instLogoInputRef.current?.click()}>
                    <div className="w-28 h-28 bg-slate-50 rounded-[32px] overflow-hidden border-2 border-dashed border-slate-200 flex items-center justify-center shadow-inner group-hover:border-blue-400 transition-colors">
                      {instData.logoUrl ? (
                        <img src={instData.logoUrl} className="w-full h-full object-contain p-2" />
                      ) : (
                        <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      )}
                    </div>
                    <input ref={instLogoInputRef} type="file" className="hidden" accept="image/*" onChange={handleInstLogo} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Nome do Órgão / Prefeitura</label>
                  <input type="text" value={instData.name} onChange={e => setInstData({...instData, name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-blue-600 outline-none transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">CNPJ</label>
                    <input type="text" value={instData.cnpj} onChange={e => setInstData({...instData, cnpj: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-blue-600 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Cidade</label>
                    <input type="text" value={instData.city} onChange={e => setInstData({...instData, city: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-blue-600 outline-none transition-all" />
                  </div>
                </div>

                <div className="pt-8 flex gap-4">
                  <button type="button" onClick={() => setStep(0)} className="flex-1 py-5 border-2 border-slate-200 text-slate-700 rounded-2xl font-black uppercase text-xs tracking-widest">Voltar</button>
                  <button onClick={() => setStep(2)} className="flex-[2] bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all">Próximo Passo</button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <header className="mb-10">
                <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Agente Master</h2>
                <p className="text-slate-500 font-medium mt-2">Crie o perfil administrativo com acesso total.</p>
              </header>

              <div className="space-y-6">
                <div className="flex flex-col items-center mb-8">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-24 h-24 bg-slate-50 rounded-[32px] overflow-hidden border-2 border-dashed border-slate-200 flex items-center justify-center shadow-inner">
                      {agentData.avatarUrl ? (
                        <img src={agentData.avatarUrl} className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      )}
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleAgentAvatar} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Nome Completo</label>
                    <input type="text" value={agentData.name} onChange={e => setAgentData({...agentData, name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-blue-600 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Login</label>
                    <input type="text" value={agentData.username} onChange={e => setAgentData({...agentData, username: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-blue-600 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Senha</label>
                    <input type="password" value={agentData.password} onChange={e => setAgentData({...agentData, password: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-blue-600 outline-none transition-all" />
                  </div>
                </div>

                <div className="pt-8 flex gap-4">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 border-2 border-slate-200 text-slate-700 py-5 rounded-2xl font-black uppercase tracking-widest">Voltar</button>
                  <button onClick={() => setStep(3)} className="flex-[2] bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all">Próximo Passo</button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleFinish} className="animate-in fade-in slide-in-from-right-4 duration-500">
              <header className="mb-10">
                <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Créditos de Autoria</h2>
                <p className="text-slate-500 font-medium mt-2">Registre os dados do desenvolvedor do sistema.</p>
              </header>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Nome do Desenvolvedor / Empresa</label>
                  <input required type="text" value={instData.developerName} onChange={e => setInstData({...instData, developerName: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-indigo-600 outline-none transition-all" placeholder="Ex: TechSolutions Softwares" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">E-mail ou Portfolio Profissional</label>
                  <input type="text" value={instData.developerContact} onChange={e => setInstData({...instData, developerContact: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-indigo-600 outline-none transition-all" placeholder="contato@desenvolvedor.com" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Breve Bio / Slogan</label>
                  <textarea rows={3} value={instData.developerBio} onChange={e => setInstData({...instData, developerBio: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-indigo-600 outline-none transition-all resize-none" placeholder="Transformando a gestão pública através da tecnologia..." />
                </div>

                <div className="pt-8 flex gap-4">
                  <button type="button" onClick={() => setStep(2)} className="flex-1 bg-slate-100 text-slate-700 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Voltar</button>
                  <button type="submit" className="flex-[2] bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">Finalizar e Ativar</button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;
