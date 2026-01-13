
import React, { useState, useEffect } from 'react';
import { Person, Agent, Institution, RelationshipType, AgentRole, AuditLog, Territory, SystemMode, BackupBundle } from './types';
import PersonForm from './components/PersonForm';
import PersonCard from './components/PersonCard';
import Reports from './components/Reports';
import SetupWizard from './components/SetupWizard';
import DashboardHome from './components/DashboardHome';
import LogsView from './components/LogsView';
import NeighborhoodManager from './components/NeighborhoodManager';
import ActivationLock from './components/ActivationLock';
import KeyManager from './components/KeyManager';
import SyncHub from './components/SyncHub'; 
import BackupManager from './components/BackupManager';
import WelcomeScreen from './components/WelcomeScreen';
import AgentForm from './components/AgentForm';
import { runDataIndexer } from './services/dataService';

const App: React.FC = () => {
  const isTrialValid = () => {
    const expiry = localStorage.getItem('trial_expiry_date');
    if (!expiry) return false;
    return new Date(expiry) > new Date();
  };

  const [activeTab, setActiveTab] = useState<'dashboard' | 'residents' | 'reports' | 'agents' | 'logs' | 'territories' | 'licenses' | 'sync' | 'backups'>('dashboard');
  const [isActivated, setIsActivated] = useState(() => 
    localStorage.getItem('system_activated') === 'true' || isTrialValid()
  );
  
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('agent_session') === 'active');
  const [showWelcome, setShowWelcome] = useState(false);
  const [currentAgentId, setCurrentAgentId] = useState(() => localStorage.getItem('current_agent_id'));
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [institution, setInstitution] = useState<Institution | null>(() => {
    const saved = localStorage.getItem('inst_data');
    return saved ? JSON.parse(saved) : null;
  });

  const [agents, setAgents] = useState<Agent[]>(() => {
    const saved = localStorage.getItem('agents_data');
    return saved ? JSON.parse(saved) : [];
  });

  const [residents, setResidents] = useState<Person[]>(() => {
    const saved = localStorage.getItem('residents_data');
    return saved ? JSON.parse(saved) : [];
  });

  const [territories, setTerritories] = useState<Territory[]>(() => {
    const saved = localStorage.getItem('territories_data');
    return saved ? JSON.parse(saved) : [];
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('audit_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [showResidentForm, setShowResidentForm] = useState(false);
  const [editingResident, setEditingResident] = useState<Person | null>(null);
  
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  const currentUser = agents.find(a => a.id === currentAgentId);
  const isAdmin = currentUser?.role === AgentRole.ADMIN;
  const isServer = institution?.systemMode === SystemMode.SERVER;

  useEffect(() => {
    if (institution) localStorage.setItem('inst_data', JSON.stringify(institution));
    localStorage.setItem('agents_data', JSON.stringify(agents));
    localStorage.setItem('residents_data', JSON.stringify(residents));
    localStorage.setItem('territories_data', JSON.stringify(territories));
    localStorage.setItem('audit_logs', JSON.stringify(auditLogs));
  }, [institution, agents, residents, auditLogs, territories]);

  const addLog = (action: AuditLog['action'], type: AuditLog['targetType'], name: string) => {
    const newLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      agentId: currentUser?.id || 'setup',
      agentName: currentUser?.name || 'Sistema',
      action,
      targetType: type,
      targetName: name,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleMergeData = (newResidents: Person[], newTerritories: Territory[]) => {
    setResidents(newResidents);
    setTerritories(newTerritories);
    addLog('SINCRONIZAR', 'SISTEMA', 'Banco de dados mesclado');
  };

  const handleFullRestore = (bundle: BackupBundle) => {
    const fixed = runDataIndexer(bundle);
    setResidents(fixed.residents);
    setAgents(fixed.agents);
    setTerritories(fixed.territories);
    if (fixed.institution) setInstitution(fixed.institution);
    if (fixed.logs) setAuditLogs(fixed.logs);
    addLog('BACKUP', 'SISTEMA', 'Restauração total aplicada');
  };

  const handleAddResident = (person: Person) => {
    if (editingResident) {
      addLog('EDITAR', 'RESIDENTE', person.name);
      setResidents(residents.map(r => r.id === person.id ? person : r));
    } else {
      addLog('CRIAR', 'RESIDENTE', person.name);
      setResidents([...residents, person]);
    }
    setShowResidentForm(false);
    setEditingResident(null);
  };

  const handleAddAgent = (agent: Agent) => {
    if (editingAgent) {
      addLog('EDITAR', 'AGENTE', agent.name);
      setAgents(agents.map(a => a.id === agent.id ? agent : a));
    } else {
      addLog('CRIAR', 'AGENTE', agent.name);
      setAgents([...agents, agent]);
    }
    setShowAgentForm(false);
    setEditingAgent(null);
  };

  const handleLogout = () => {
    if (!window.confirm("Deseja encerrar sua sessão operacional?")) return;
    addLog('LOGOUT', 'SISTEMA', 'Sessão encerrada');
    setIsLoggedIn(false);
    setCurrentAgentId(null);
    localStorage.removeItem('agent_session');
    localStorage.removeItem('current_agent_id');
  };

  const handleAppClose = () => {
    if (window.confirm("Deseja fechar o sistema? Certifique-se de que realizou o backup.")) {
       addLog('LOGOUT', 'SISTEMA', 'Aplicativo encerrado');
       window.close();
    }
  };

  const handleAppRestart = () => {
    if (window.confirm("Deseja reiniciar a interface do sistema?")) {
      window.location.reload();
    }
  };

  const filteredResidents = residents.filter(r => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return r.name.toLowerCase().includes(term) || 
           (r.cpf && r.cpf.includes(term)) || 
           (r.neighborhood || '').toLowerCase().includes(term);
  });

  // Re-verifica ativação toda vez que o app monta para lidar com expiração de trial
  useEffect(() => {
    const checkActivation = () => {
      setIsActivated(localStorage.getItem('system_activated') === 'true' || isTrialValid());
    };
    const interval = setInterval(checkActivation, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  if (!isActivated) return <ActivationLock onActivate={() => setIsActivated(true)} />;
  
  if (!institution || agents.length === 0) return (
    <SetupWizard onComplete={(inst, agent) => { 
      setInstitution(inst); 
      setAgents([agent]); 
      setIsLoggedIn(true); 
      setCurrentAgentId(agent.id);
      localStorage.setItem('agent_session', 'active');
      localStorage.setItem('current_agent_id', agent.id);
      setShowWelcome(true);
    }} />
  );

  if (showWelcome) return <WelcomeScreen institution={institution} onContinue={() => setShowWelcome(false)} />;

  if (!isLoggedIn) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 w-full max-w-md rounded-[3rem] shadow-2xl p-12 text-white overflow-hidden relative animate-in fade-in zoom-in-95 duration-500">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-600"></div>
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
            <img src={institution.logoUrl} className="h-12 w-12 object-contain" alt="Logo" />
          </div>
          <h2 className="text-2xl font-black text-center uppercase tracking-tighter">{institution.name}</h2>
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mt-2">Operacional • {isServer ? 'SERVIDOR' : 'ESTAÇÃO'}</span>
        </div>
        <form onSubmit={(e) => { 
            e.preventDefault(); 
            const userVal = (e.currentTarget.elements[0] as HTMLInputElement).value;
            const passVal = (e.currentTarget.elements[1] as HTMLInputElement).value;
            const agent = agents.find(a => a.username === userVal && a.password === passVal);
            
            if (agent) {
                setIsLoggedIn(true); 
                setCurrentAgentId(agent.id); 
                localStorage.setItem('agent_session', 'active'); 
                localStorage.setItem('current_agent_id', agent.id);
                addLog('LOGIN', 'SISTEMA', `Acesso concedido: ${agent.name}`);
            } else {
                alert("Credenciais incorretas.");
            }
        }} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Usuário</label>
            <input required type="text" className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-indigo-500 outline-none font-bold text-white transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Senha</label>
            <input required type="password" className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-indigo-500 outline-none font-bold text-white transition-all" />
          </div>
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all">Acessar Painel</button>
        </form>
      </div>
    </div>
  );

  const NavItem = ({ tab, label, icon }: { tab: typeof activeTab, label: string, icon: React.ReactNode }) => (
    <button 
      onClick={() => setActiveTab(tab)}
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 relative group ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
    >
      <span className={`${activeTab === tab ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}>{icon}</span>
      <span className={`text-sm font-black uppercase tracking-wide whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
        {label}
      </span>
      {activeTab === tab && <div className="absolute left-0 w-1 h-6 bg-white rounded-full"></div>}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-900">
      <aside className={`bg-slate-950 text-white flex flex-col fixed inset-y-0 z-40 transition-all duration-500 ease-in-out shadow-2xl ${isSidebarOpen ? 'w-72' : 'w-24'}`}>
        <div className="p-8 mb-6 flex items-center justify-between">
          <div className={`flex items-center gap-3 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
            <img src={institution.logoUrl} className="w-10 h-10 object-contain bg-white rounded-xl p-1.5" alt="Logo" />
            <div className="overflow-hidden">
              <h1 className="font-black text-[10px] uppercase text-indigo-400 tracking-widest leading-none">GESTÃO</h1>
              <p className="text-[11px] text-white font-black truncate uppercase mt-1 tracking-tight">{institution.name}</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 transition-all">
            <svg className={`w-5 h-5 transition-transform duration-500 ${!isSidebarOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          <NavItem tab="dashboard" label="Home" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>} />
          <NavItem tab="sync" label="Sincronização" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>} />
          <NavItem tab="residents" label="Moradores" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" /></svg>} />
          <NavItem tab="territories" label="Bairros" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>} />
          {(isServer || isAdmin) && <NavItem tab="reports" label="Analíticos" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 022 2h2a2 2 0 002-2z" /></svg>} />}
          {isAdmin && (
            <div className="pt-6 mt-6 border-t border-white/5 space-y-2">
              <NavItem tab="agents" label="Agentes" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
              <NavItem tab="backups" label="Redundância" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>} />
              <NavItem tab="licenses" label="Licenças" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>} />
              <NavItem tab="logs" label="Auditoria" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
            </div>
          )}
        </nav>

        <div className="p-4 bg-slate-900 border-t border-white/5 space-y-2">
           <div className={`px-4 py-2 border border-white/5 rounded-xl mb-4 ${isSidebarOpen ? 'block' : 'hidden'}`}>
             <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Software de Autoria</p>
             <p className="text-[10px] font-bold text-white uppercase truncate">{institution?.developerName || 'TechSolutions'}</p>
           </div>
           <button onClick={handleAppRestart} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
             <span className={`text-[10px] font-black uppercase tracking-widest ${isSidebarOpen ? 'block' : 'hidden'}`}>Reiniciar</span>
           </button>
           <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
             <span className={`text-[10px] font-black uppercase tracking-widest ${isSidebarOpen ? 'block' : 'hidden'}`}>Sair</span>
           </button>
           <button onClick={handleAppClose} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
             <span className={`text-[10px] font-black uppercase tracking-widest ${isSidebarOpen ? 'block' : 'hidden'}`}>Fechar</span>
           </button>
        </div>
      </aside>

      <main className={`flex-1 min-h-screen transition-all duration-500 ${isSidebarOpen ? 'ml-72' : 'ml-24'}`}>
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{isServer ? 'MODO SERVIDOR' : 'MODO ESTAÇÃO'}</span>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mt-1">Gestão Governamental</h2>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <span className="text-sm font-black text-slate-900 uppercase block leading-none">{currentUser?.name}</span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{currentUser?.role}</span>
            </div>
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-xl border-2 border-white overflow-hidden">
               {currentUser?.avatarUrl ? <img src={currentUser.avatarUrl} className="w-full h-full object-cover" /> : currentUser?.name?.charAt(0)}
            </div>
          </div>
        </header>

        <div className="p-10 max-w-[1600px] mx-auto">
          {activeTab === 'dashboard' && <DashboardHome residents={residents} onAction={(t, f) => { setActiveTab(t as any); if(f) setShowResidentForm(true); }} agentName={currentUser?.name || 'Agente'} isAdmin={isAdmin} />}
          
          {activeTab === 'residents' && (
             <div className="space-y-8">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="relative w-full max-w-xl group">
                    <svg className="w-5 h-5 absolute left-5 top-4.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input type="text" placeholder="Filtrar moradores por nome ou CPF..." className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-600 focus:bg-white font-bold transition-all shadow-inner" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                  <button onClick={() => { setShowResidentForm(true); setEditingResident(null); }} className="bg-indigo-600 text-white px-8 py-4.5 rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Novo Cadastro</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {filteredResidents.map(resident => (
                    <PersonCard key={resident.id} person={resident} onEdit={(p) => { setEditingResident(p); setShowResidentForm(true); }} onDelete={(id) => { addLog('EXCLUIR', 'RESIDENTE', resident.name); setResidents(residents.filter(r => r.id !== id)); }} isAdmin={isAdmin} />
                  ))}
                </div>
             </div>
          )}

          {activeTab === 'agents' && isAdmin && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Corpo de Agentes</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Gestão de credenciais e permissões</p>
                  </div>
                  <button onClick={() => { setShowAgentForm(true); setEditingAgent(null); }} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all">Novo Agente</button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {agents.map(agent => (
                    <div key={agent.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:border-indigo-400 transition-all flex flex-col items-center text-center group">
                       <div className="w-24 h-24 bg-slate-50 rounded-[2rem] border-2 border-slate-100 mb-6 flex items-center justify-center overflow-hidden">
                          {agent.avatarUrl ? <img src={agent.avatarUrl} className="w-full h-full object-cover" /> : <span className="text-3xl font-black text-slate-300">{agent.name.charAt(0)}</span>}
                       </div>
                       <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-1">{agent.name}</h4>
                       <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest mb-6 ${agent.role === AgentRole.ADMIN ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-500'}`}>
                         {agent.role === AgentRole.ADMIN ? 'Administrador' : 'Operador'}
                       </span>
                       <div className="grid grid-cols-2 gap-3 w-full border-t border-slate-50 pt-6">
                         <button onClick={() => { setEditingAgent(agent); setShowAgentForm(true); }} className="py-3 bg-slate-50 text-slate-500 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition-all">Editar</button>
                         {agent.id !== currentUser?.id && (
                           <button onClick={() => { if(window.confirm("Remover este agente?")) { setAgents(agents.filter(a => a.id !== agent.id)); addLog('EXCLUIR', 'AGENTE', agent.name); } }} className="py-3 bg-red-50 text-red-400 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-500 hover:text-white transition-all">Excluir</button>
                         )}
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeTab === 'sync' && <SyncHub currentResidents={residents} currentTerritories={territories} institution={institution} onMerge={handleMergeData} onAddLog={addLog} />}
          {activeTab === 'territories' && <NeighborhoodManager territories={territories} onAdd={(t) => { setTerritories([...territories, t]); addLog('CRIAR', 'TERRITORIO', t.street); }} onDelete={(id) => { setTerritories(territories.filter(t => t.id !== id)); addLog('EXCLUIR', 'TERRITORIO', 'ID: '+id); }} isAdmin={isAdmin} />}
          {activeTab === 'reports' && (isServer || isAdmin) && <Reports residents={residents} institutionName={institution.name} />}
          {activeTab === 'backups' && isAdmin && <BackupManager institution={institution} residents={residents} agents={agents} logs={auditLogs} territories={territories} onImport={handleFullRestore} onAddLog={addLog} />}
          {activeTab === 'licenses' && isAdmin && <KeyManager onAddLog={addLog} />}
          {activeTab === 'logs' && <LogsView logs={auditLogs} />}
        </div>
      </main>

      {showResidentForm && (
        <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[3.5rem] shadow-2xl">
            <PersonForm onSubmit={handleAddResident} onCancel={() => { setShowResidentForm(false); setEditingResident(null); }} initialData={editingResident} isHeadAlreadySet={residents.some(r => r.relationship === RelationshipType.HEAD && r.id !== editingResident?.id)} />
          </div>
        </div>
      )}

      {showAgentForm && (
        <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
          <AgentForm onSubmit={handleAddAgent} onCancel={() => { setShowAgentForm(false); setEditingAgent(null); }} initialData={editingAgent} />
        </div>
      )}
    </div>
  );
};

export default App;
