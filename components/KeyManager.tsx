
import React, { useState, useEffect } from 'react';
import { ActivationKey } from '../types';

interface KeyManagerProps {
  onAddLog: (action: any, type: any, name: string) => void;
}

const Tooltip = ({ text }: { text: string }) => (
  <div className="tooltip-content absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded pointer-events-none whitespace-nowrap z-50">
    {text}
  </div>
);

const KeyManager: React.FC<KeyManagerProps> = ({ onAddLog }) => {
  const [keys, setKeys] = useState<ActivationKey[]>(() => {
    const saved = localStorage.getItem('system_licenses');
    return saved ? JSON.parse(saved) : [];
  });
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('system_licenses', JSON.stringify(keys));
  }, [keys]);

  const generateRandomKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segment = () => Array.from({ length: 4 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    const newKeyString = `${segment()}-${segment()}-${segment()}-${segment()}`;
    
    const newKey: ActivationKey = {
      id: Math.random().toString(36).substr(2, 9),
      key: newKeyString,
      createdAt: new Date().toISOString(),
      status: 'Ativa'
    };

    setKeys([newKey, ...keys]);
    onAddLog('GERAR_CHAVE', 'LICENCA', newKeyString);
  };

  const deleteKey = (id: string, keyVal: string) => {
    if (window.confirm(`Deseja revogar a licença ${keyVal}?`)) {
      setKeys(keys.filter(k => k.id !== id));
      onAddLog('EXCLUIR', 'LICENCA', keyVal);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(text);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-indigo-200">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Gerador de Licenças</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Controle de ativação de novos terminais</p>
          </div>
        </div>
        <button 
          onClick={generateRandomKey}
          className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-900/20 transition-all active:scale-95 flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Gerar Nova Chave Aleatória
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {keys.map(item => (
          <div key={item.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Criada em: {new Date(item.createdAt).toLocaleDateString()}</span>
              <div className="group relative">
                <button 
                  onClick={() => deleteKey(item.id, item.key)}
                  className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
                <Tooltip text="Revogar Licença" />
              </div>
            </div>
            
            <div 
              onClick={() => copyToClipboard(item.key)}
              className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 transition-all group/key"
            >
              <span className="text-xl font-mono font-black text-slate-800 tracking-[0.3em] group-hover/key:text-indigo-600 transition-colors">
                {item.key}
              </span>
              <span className={`text-[9px] font-black uppercase tracking-widest mt-4 ${copySuccess === item.key ? 'text-indigo-600' : 'text-slate-400'}`}>
                {copySuccess === item.key ? 'Copiado com sucesso!' : 'Clique para copiar chave'}
              </span>
            </div>
          </div>
        ))}

        {keys.length === 0 && (
          <div className="col-span-full py-20 bg-slate-50 border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center opacity-50">
            <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
            <p className="text-sm font-black uppercase text-slate-400 tracking-widest">Nenhuma licença gerada no sistema</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KeyManager;
