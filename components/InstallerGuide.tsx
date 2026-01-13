
import React, { useState } from 'react';

const InstallerGuide: React.FC = () => {
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(id);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-32 animate-in fade-in duration-700">
      <header className="text-center space-y-4">
        <div className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
          Protocolo de Manutenção v3.0
        </div>
        <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Guia de Atualização</h2>
        <p className="text-slate-500 font-medium">Como gerar um novo .exe após alterar o código de forma rápida.</p>
      </header>

      {/* Seção Express - NOVIDADE */}
      <div className="bg-indigo-600 p-10 rounded-[3rem] text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-white text-indigo-600 rounded-lg flex items-center justify-center font-black">⚡</div>
            <h3 className="text-xl font-black uppercase tracking-tight">Atualização Express (Recomendado)</h3>
          </div>
          <p className="text-indigo-100 text-sm mb-8 leading-relaxed">
            Sempre que você mudar algo no código e quiser gerar o novo .exe imediatamente, use este comando único no terminal da pasta do projeto:
          </p>
          <div className="bg-slate-950 p-6 rounded-2xl relative group border border-indigo-400/30">
            <code className="text-indigo-400 font-mono text-sm">npm run pack</code>
            <button 
              onClick={() => copyToClipboard('npm run pack', 'express')} 
              className="absolute right-6 top-5 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors"
            >
              {copyStatus === 'express' ? 'Copiado!' : 'Copiar Comando'}
            </button>
          </div>
          <div className="mt-6 flex gap-4">
            <div className="flex-1 bg-white/10 p-4 rounded-xl text-[10px] font-bold uppercase tracking-tight">
              1. Limpa arquivos antigos
            </div>
            <div className="flex-1 bg-white/10 p-4 rounded-xl text-[10px] font-bold uppercase tracking-tight">
              2. Recompila o código novo
            </div>
            <div className="flex-1 bg-white/10 p-4 rounded-xl text-[10px] font-bold uppercase tracking-tight">
              3. Gera a pasta do .exe
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <h4 className="font-black text-slate-900 uppercase mb-4 text-sm">Onde encontrar o resultado?</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Após o comando terminar, vá na pasta: <br/>
            <code className="bg-slate-100 px-2 py-1 rounded mt-2 inline-block font-bold">dist/GestaoPublica-win32-x64</code>
          </p>
          <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <p className="text-[10px] text-blue-700 font-bold uppercase">Dica Prática:</p>
            <p className="text-[10px] text-blue-600 mt-1">
              O arquivo que o cliente abre é o <b>GestaoPublica.exe</b>. Não esqueça de enviar a pasta toda (ou zipada).
            </p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <h4 className="font-black text-slate-900 uppercase mb-4 text-sm">Resolução de Problemas</h4>
          <div className="space-y-4">
            <div className="flex gap-3">
              <span className="text-indigo-600 font-bold">Q:</span>
              <p className="text-[10px] font-medium text-slate-600 uppercase tracking-tight">O .exe não abre ou dá erro de tela branca?</p>
            </div>
            <p className="text-[9px] text-slate-400 pl-6 leading-relaxed">
              Verifique se o arquivo <b>index.js</b> (sem o 'x') foi criado na raiz. Se não foi, o comando de build falhou antes de empacotar. Rode <b>npm run build</b> separado para ver o erro.
            </p>
          </div>
        </div>
      </div>

      <footer className="text-center pt-10">
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">Secretaria de Tecnologia • Gestão de Assets</p>
      </footer>
    </div>
  );
};

export default InstallerGuide;
