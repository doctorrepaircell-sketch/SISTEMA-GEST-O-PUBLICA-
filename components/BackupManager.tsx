
import React, { useState, useEffect } from 'react';
import { Person, Agent, Territory, AuditLog, Institution, BackupConfig, BackupBundle } from '../types';
import { exportBackup, importBackup, runDataIndexer } from '../services/dataService';

interface BackupManagerProps {
  institution: Institution;
  residents: Person[];
  agents: Agent[];
  logs: AuditLog[];
  territories: Territory[];
  onImport: (bundle: BackupBundle) => void;
  onAddLog: (action: any, type: any, name: string) => void;
}

const BackupManager: React.FC<BackupManagerProps> = ({ 
  institution, residents, agents, logs, territories, onImport, onAddLog 
}) => {
  const [config, setConfig] = useState<BackupConfig>(() => {
    const saved = localStorage.getItem('backup_settings');
    return saved ? JSON.parse(saved) : {
      autoBackupEnabled: true,
      frequency: 'daily',
      remindMe: true
    };
  });

  const [shadowCopyTime, setShadowCopyTime] = useState<string | null>(localStorage.getItem('shadow_copy_timestamp'));

  useEffect(() => {
    localStorage.setItem('backup_settings', JSON.stringify(config));
  }, [config]);

  const handleManualBackup = () => {
    const bundle: BackupBundle = runDataIndexer({
      institution,
      agents,
      residents,
      logs,
      territories,
      config
    });
    
    exportBackup(bundle);
    const now = new Date().toISOString();
    setConfig(prev => ({ ...prev, lastBackupDate: now }));
    onAddLog('BACKUP', 'SISTEMA', 'Exportação manual de segurança');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (window.confirm("ATENÇÃO: Restaurar um backup substituirá TODOS os dados atuais. Deseja prosseguir?")) {
      try {
        const bundle = await importBackup(file);
        onImport(bundle);
        onAddLog('BACKUP', 'SISTEMA', `Restauração concluída: ${file.name}`);
        alert("Dados restaurados com sucesso!");
      } catch (err) {
        alert("Erro ao restaurar backup: " + (err as Error).message);
      }
    }
  };

  const getHealthScore = () => {
    if (residents.length === 0) return { score: '--', label: 'Base Vazia', color: 'text-slate-400' };
    const missingCpf = residents.filter(r => !r.cpf).length;
    if (missingCpf > 0) return { score: 'B', label: 'Requer Atenção', color: 'text-amber-500' };
    return { score: 'A+', label: 'Excelente', color: 'text-emerald-500' };
  };

  const health = getHealthScore();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header Visual */}
      <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Cofre Institucional</span>
            </div>
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">Central de Redundância</h2>
            <p className="text-slate-400 font-medium leading-relaxed">
              Proteja o patrimônio de dados da {institution.name}. Configure lembretes automáticos e gerencie pontos de restauração.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 min-w-[300px]">
            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Integridade</span>
              <span className={`text-2xl font-black ${health.color}`}>{health.score}</span>
              <p className="text-[8px] font-bold text-slate-500 uppercase mt-1">{health.label}</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Backup Sombra</span>
              <span className="text-xs font-mono font-bold text-white uppercase">
                {shadowCopyTime ? new Date(shadowCopyTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Inativo'}
              </span>
              <p className="text-[8px] font-bold text-slate-500 uppercase mt-1">Sincronia Local</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configurações de Automação */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-8 flex items-center gap-3">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
              Preferências de Redundância
            </h3>

            <div className="space-y-10">
              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <div>
                  <h4 className="font-black text-sm uppercase text-slate-800">Lembretes de Backup</h4>
                  <p className="text-xs text-slate-500 font-medium">Notificar quando for necessário gerar nova exportação.</p>
                </div>
                <button 
                  onClick={() => setConfig({...config, remindMe: !config.remindMe})}
                  className={`w-14 h-8 rounded-full transition-all relative ${config.remindMe ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${config.remindMe ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Frequência da Rotina</label>
                <div className="grid grid-cols-3 gap-4">
                  {(['daily', 'weekly', 'monthly'] as const).map(f => (
                    <button 
                      key={f}
                      onClick={() => setConfig({...config, frequency: f})}
                      className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${config.frequency === f ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-indigo-200'}`}
                    >
                      {f === 'daily' ? 'Diária' : f === 'weekly' ? 'Semanal' : 'Mensal'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-start gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <h5 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-1">Sobre a Cópia de Sombra</h5>
                  <p className="text-xs text-indigo-700 leading-relaxed font-medium">
                    O sistema mantém uma cópia silenciosa de todos os dados no navegador a cada 5 minutos. Isso protege contra fechamentos acidentais ou quedas de energia, mas NÃO substitui a exportação do arquivo físico.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ações de Arquivo */}
        <div className="space-y-8">
          <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-xl flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-6 border border-white/5">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            </div>
            <h4 className="text-lg font-black uppercase tracking-tighter mb-2">Exportação Geral</h4>
            <p className="text-xs text-slate-500 font-medium mb-8">Gere agora um pacote criptografado com todos os dados.</p>
            <button 
              onClick={handleManualBackup}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-900/40 transition-all active:scale-95"
            >
              Iniciar Exportação
            </button>
            {config.lastBackupDate && (
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-4">Último: {new Date(config.lastBackupDate).toLocaleString('pt-BR')}</span>
            )}
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-6 border border-slate-100">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </div>
            <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-2">Restaurar Base</h4>
            <p className="text-xs text-slate-400 font-medium mb-8">Importe um arquivo .json para restaurar um ponto anterior.</p>
            <label className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer text-center">
              Carregar Arquivo
              <input type="file" className="hidden" accept=".json" onChange={handleFileUpload} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupManager;
