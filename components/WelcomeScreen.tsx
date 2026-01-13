
import React from 'react';
import { Institution } from '../types';

interface WelcomeScreenProps {
  institution: Institution;
  onContinue: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ institution, onContinue }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex items-center justify-center p-6 overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/10 rounded-full -mr-96 -mt-96 blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full -ml-48 -mb-48 blur-[100px]"></div>

      <div className="max-w-4xl w-full flex flex-col items-center text-center relative z-10 animate-in fade-in zoom-in-95 duration-1000">
        <div className="w-32 h-32 bg-white rounded-[2.5rem] p-6 shadow-2xl mb-10 animate-bounce transition-all duration-1000">
          <img src={institution.logoUrl} alt="Logo" className="w-full h-full object-contain" />
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-6 leading-none">
          Bem-vindo ao <br/>
          <span className="text-indigo-500">Sistema de Gestão Pública</span>
        </h1>

        <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mb-12">
          O portal operacional da {institution.name} está pronto. <br/>
          Tecnologia avançada para o desenvolvimento da nossa comunidade.
        </p>

        <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-[2.5rem] p-8 mb-12 backdrop-blur-md">
           <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] block mb-3">Autoria do Software</span>
           <h4 className="text-xl font-black text-white uppercase tracking-tight mb-1">{institution.developerName || 'Desenvolvimento Proprietário'}</h4>
           <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{institution.developerContact || 'contato@suporte.com'}</p>
           {institution.developerBio && (
             <p className="mt-4 text-[10px] text-slate-400 font-medium italic leading-relaxed">"{institution.developerBio}"</p>
           )}
        </div>

        <button 
          onClick={onContinue}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-16 py-6 rounded-3xl font-black uppercase text-sm tracking-[0.2em] shadow-2xl shadow-indigo-900/40 transition-all hover:scale-105 active:scale-95"
        >
          Acessar Painel de Controle
        </button>

        <footer className="mt-16 pt-8 border-t border-white/5 w-full flex justify-center">
           <div className="flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-widest">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.342l-7 5A1 1 0 004 8h3v8a1 1 0 001 1h2a1 1 0 001-1V8h3a1 1 0 00.935-1.724l-3-4.5z" clipRule="evenodd" /></svg>
              Powered by Core Engine v2.9
           </div>
        </footer>
      </div>
    </div>
  );
};

export default WelcomeScreen;
