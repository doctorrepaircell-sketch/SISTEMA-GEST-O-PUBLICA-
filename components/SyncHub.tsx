
import React, { useState, useRef } from 'react';
import { Person, Territory, BackupBundle, SystemMode, Institution } from '../types';
import { runDataIndexer } from '../services/dataService';

interface SyncHubProps {
  currentResidents: Person[];
  currentTerritories: Territory[];
  institution: Institution;
  onMerge: (residents: Person[], territories: Territory[]) => void;
  onAddLog: (action: any, type: any, name: string) => void;
}

const SyncHub: React.FC<SyncHubProps> = ({ currentResidents, currentTerritories, institution, onMerge, onAddLog }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isServer = institution.systemMode === SystemMode.SERVER;

  const handleExportForServer = () => {
    setIsProcessing(true);
    try {
      const bundle: BackupBundle = runDataIndexer({
        institution,
        residents: currentResidents,
        territories: currentTerritories,
        timestamp: new Date().toISOString()
      });

      const dataStr = JSON.stringify(bundle, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const exportFileDefaultName = `coleta_estacao_${institution.city.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      onAddLog('SINCRONIZAR', 'SISTEMA', 'Pacote de coleta gerado para o servidor');
      setSyncStatus({ message: 'Pacote de coleta gerado com sucesso! Envie este arquivo ao administrador do servidor.', type: 'success' });
    } catch (err) {
      setSyncStatus({ message: 'Erro ao gerar pacote: ' + (err as Error).message, type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSyncFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setSyncStatus({ message: 'Lendo pacote de dados...', type: 'info' });

    try {
      const content = await file.text();
      const bundle: BackupBundle = JSON.parse(content);

      if (!bundle.residents || !Array.isArray(bundle.residents)) {
        throw new Error('Formato de dados incompatível.');
      }

      const mergedResidents = [...currentResidents];
      let newCount = 0;
      let updatedCount = 0;

      bundle.residents.forEach(incoming => {
        const existingIdx = mergedResidents.findIndex(r => r.cpf === incoming.cpf);
        if (existingIdx > -1) {
          mergedResidents[existingIdx] = { ...mergedResidents[existingIdx], ...incoming };
          updatedCount++;
        } else {
          mergedResidents.push(incoming);
          newCount++;
        }
      });

      const mergedTerritories = [...currentTerritories];
      bundle.territories?.forEach(incoming => {
        if (!mergedTerritories.find(t => t.street === incoming.street && t.number === incoming.number)) {
          mergedTerritories.push(incoming);
        }
      });

      onMerge(mergedResidents, mergedTerritories);
      onAddLog('SINCRONIZAR', 'SISTEMA', `Pacote de ${file.name} processado`);
      
      setSyncStatus({ 
        message: `Sincronização Concluída! ${newCount} novos registros e ${updatedCount} atualizações inseridas no banco.`, 
        type: 'success' 
      });
    } catch (err) {
      setSyncStatus({ message: 'Erro ao processar arquivo: ' + (err as Error).message, type: 'error' });
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 ${isServer ? 'bg-indigo-600' : 'bg-emerald-600'} rounded-2xl flex items-center justify-center text-white shadow-2xl`}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                {isServer ? 'Sync Hub: Servidor' : 'Sync Hub: Estação'}
              </h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                {isServer ? 'Consolidação de dados recebidos das estações' : 'Preparação de dados para o servidor central'}
              </p>
            </div>
          </div>

          {isServer ? (
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isProcessing ? 'Processando...' : 'Receber Coleta Externa'}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".json" 
                onChange={handleSyncFile} 
              />
            </button>
          ) : (
            <button 
              onClick={handleExportForServer}
              disabled={isProcessing}
              className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isProcessing ? 'Gerando...' : 'Enviar Dados ao Servidor'}
            </button>
          )}
        </div>

        {syncStatus && (
          <div className={`p-6 rounded-3xl border-2 mb-8 animate-in zoom-in-95 duration-300 ${
            syncStatus.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
            syncStatus.type === 'error' ? 'bg-red-50 border-red-100 text-red-800' :
            'bg-blue-50 border-blue-100 text-blue-800'
          }`}>
            <div className="flex items-center gap-4">
              <div className="font-black uppercase text-[10px] tracking-widest">{syncStatus.message}</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Informações do Protocolo</h4>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-slate-900">1</div>
                <p className="text-xs font-medium text-slate-600 leading-relaxed">
                  {isServer 
                    ? 'O Servidor Central unifica os arquivos gerados pelas Estações de Coleta.' 
                    : 'A Estação gera um arquivo contendo todos os moradores e territórios cadastrados neste dispositivo.'}
                </p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-slate-900">2</div>
                <p className="text-xs font-medium text-slate-600 leading-relaxed">
                  {isServer 
                    ? 'Duplicidades são tratadas automaticamente através do CPF do cidadão.' 
                    : 'Após gerar o arquivo, ele deve ser transportado (pendrive ou rede) para o computador Servidor.'}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-8 rounded-[2.5rem] text-white relative overflow-hidden ${isServer ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
            <h4 className="text-[10px] font-black uppercase tracking-widest mb-4">Volume Local de Dados</h4>
            <div className="flex items-end gap-3 mb-6">
              <span className="text-5xl font-black">{currentResidents.length}</span>
              <span className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2">Pessoas no Dispositivo</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest mt-4 opacity-60">
              {isServer ? 'Banco de Dados Mestre' : 'Banco de Dados de Campo'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyncHub;
