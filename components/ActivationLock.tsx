
import React, { useState, useEffect } from 'react';

interface ActivationLockProps {
  onActivate: () => void;
}

const ActivationLock: React.FC<ActivationLockProps> = ({ onActivate }) => {
  const [activationKey, setActivationKey] = useState('');
  const [error, setError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Estados para o Gerador Master
  const [showMasterPanel, setShowMasterPanel] = useState(false);
  const [masterPass, setMasterPass] = useState('');
  const [masterError, setMasterError] = useState(false);
  const [generatedKey, setGeneratedKey] = useState('');
  const [trialDaysInput, setTrialDaysInput] = useState('7');

  // Informações do Desenvolvedor (Fallback caso o setup não tenha sido feito)
  const DEVELOPER_INFO = {
    name: "TechSolutions Softwares",
    contact: "contato@suporte.gov.br",
    whatsapp: "+55 (00) 00000-0000"
  };

  const MASTER_AUTH = 'Je020719@@';

  // Lógica de Trial
  const getTrialExpiry = () => localStorage.getItem('trial_expiry_date');
  
  const getDaysRemaining = () => {
    const expiry = getTrialExpiry();
    if (!expiry) return null;
    const diff = new Date(expiry).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const daysRemaining = getDaysRemaining();
  const isTrialExpired = daysRemaining !== null && daysRemaining <= 0;
  const isTrialActive = daysRemaining !== null && daysRemaining > 0;

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError(false);

    const savedKeys = localStorage.getItem('system_licenses');
    const validKeys: any[] = savedKeys ? JSON.parse(savedKeys) : [];
    const MASTER_EMERGENCY = 'GESTAO-2025-PRO';

    setTimeout(() => {
      const inputKey = activationKey.toUpperCase().trim();
      const isValid = inputKey === MASTER_EMERGENCY || validKeys.some(k => k.key === inputKey);

      if (isValid) {
        localStorage.setItem('system_activated', 'true');
        localStorage.removeItem('trial_expiry_date'); // Remove trial se ativar definitivo
        onActivate();
      } else {
        setError(true);
        setIsVerifying(false);
        setActivationKey('');
      }
    }, 1200);
  };

  const handleStartTrial = (days: number) => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);
    localStorage.setItem('trial_expiry_date', expiryDate.toISOString());
    localStorage.removeItem('system_activated'); // Garante que não é definitiva
    onActivate();
  };

  const handleGenerateWithMaster = (e: React.FormEvent) => {
    e.preventDefault();
    setMasterError(false);

    if (masterPass === MASTER_AUTH) {
      // Se o foco for liberar período de teste
      if (trialDaysInput && parseInt(trialDaysInput) > 0) {
        handleStartTrial(parseInt(trialDaysInput));
        return;
      }

      // Senão, gera chave normal
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const segment = () => Array.from({ length: 4 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
      const newKeyString = `${segment()}-${segment()}-${segment()}-${segment()}`;

      const savedKeys = localStorage.getItem('system_licenses');
      const keys = savedKeys ? JSON.parse(savedKeys) : [];
      keys.push({
        id: Math.random().toString(36).substr(2, 9),
        key: newKeyString,
        createdAt: new Date().toISOString(),
        status: 'Ativa'
      });
      localStorage.setItem('system_licenses', JSON.stringify(keys));

      setGeneratedKey(newKeyString);
      setActivationKey(newKeyString);
      setMasterPass('');
    } else {
      setMasterError(true);
      setMasterPass('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-lg space-y-6 relative z-10">
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-12 shadow-2xl animate-in fade-in zoom-in-95 duration-700">
          <div className="flex flex-col items-center text-center mb-10">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-white mb-8 shadow-2xl ${isTrialExpired ? 'bg-red-600 shadow-red-900/50' : 'bg-indigo-600 shadow-indigo-900/50'}`}>
              {isTrialExpired ? (
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              ) : (
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              )}
            </div>
            
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">
              {isTrialExpired ? 'Licença Expirada' : (isTrialActive ? 'Versão de Avaliação' : 'Ativação Requerida')}
            </h2>
            
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest leading-relaxed">
              {isTrialExpired 
                ? 'O seu período de teste chegou ao fim.' 
                : (isTrialActive ? `Você possui ${daysRemaining} dias de acesso restante.` : 'Insira a chave para liberar o acesso ao terminal.')}
            </p>
          </div>

          {isTrialExpired ? (
            <div className="space-y-6 animate-in slide-in-from-bottom-2">
              <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6 text-center">
                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">Solicite uma Nova Liberação</p>
                <p className="text-white font-black text-lg">{DEVELOPER_INFO.name}</p>
                <p className="text-slate-400 text-xs mt-1 font-bold uppercase tracking-tight">{DEVELOPER_INFO.contact}</p>
              </div>
              <button 
                onClick={() => setShowMasterPanel(true)}
                className="w-full bg-white/5 border border-white/10 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all"
              >
                Tenho uma nova chave
              </button>
            </div>
          ) : (
            <form onSubmit={handleActivate} className="space-y-6">
              <div className="relative group">
                <input
                  type="text"
                  value={activationKey}
                  onChange={(e) => setActivationKey(e.target.value)}
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  className={`w-full bg-slate-900/50 border-2 ${error ? 'border-red-500 animate-pulse' : 'border-white/10'} rounded-2xl px-6 py-5 text-white font-mono text-center text-xl tracking-[0.2em] outline-none focus:border-indigo-600 transition-all placeholder:text-slate-700 uppercase`}
                  disabled={isVerifying}
                />
                {error && <p className="text-center text-red-500 text-[9px] font-black uppercase tracking-widest mt-2">Chave inválida ou já utilizada</p>}
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={isVerifying || !activationKey}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-3"
                >
                  {isVerifying ? 'Verificando...' : 'Ativar Licença'}
                </button>
                
                {isTrialActive && (
                  <button
                    type="button"
                    onClick={() => onActivate()}
                    className="w-full bg-white/5 border border-white/10 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
                  >
                    Continuar Teste
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Painel Master */}
        <div className="flex flex-col items-center">
          {!showMasterPanel ? (
            <button onClick={() => setShowMasterPanel(true)} className="text-[10px] font-black text-slate-500 hover:text-indigo-400 uppercase tracking-[0.3em] transition-colors py-2">
              Menu Desenvolvedor • Master Access
            </button>
          ) : (
            <div className="w-full bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-[2rem] p-8 animate-in slide-in-from-top-4 duration-500">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-black text-white uppercase tracking-widest">Painel do Desenvolvedor</h3>
                <button onClick={() => setShowMasterPanel(false)} className="text-slate-500 hover:text-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              
              <form onSubmit={handleGenerateWithMaster} className="space-y-4">
                <input
                  type="password"
                  value={masterPass}
                  onChange={(e) => setMasterPass(e.target.value)}
                  placeholder="Senha Master"
                  className={`w-full bg-slate-950 border ${masterError ? 'border-red-500' : 'border-white/10'} rounded-xl px-5 py-3 text-white text-sm outline-none focus:border-indigo-600 transition-all`}
                />
                
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-[8px] font-black text-slate-500 uppercase ml-1 block mb-1">Dias de Teste</label>
                    <input
                      type="number"
                      value={trialDaysInput}
                      onChange={(e) => setTrialDaysInput(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-5 py-3 text-white text-sm outline-none"
                    />
                  </div>
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 rounded-xl font-black uppercase text-[10px] tracking-widest mt-5">Liberar</button>
                </div>
                
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter text-center">Para gerar licença definitiva, deixe o campo "Dias" em 0 ou vazio.</p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivationLock;
