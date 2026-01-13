
import React, { useState } from 'react';
import { Territory } from '../types';

interface NeighborhoodManagerProps {
  territories: Territory[];
  onAdd: (t: Territory) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

const Tooltip = ({ text }: { text: string }) => (
  <div className="tooltip-content absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded pointer-events-none whitespace-nowrap z-50">
    {text}
  </div>
);

const NeighborhoodManager: React.FC<NeighborhoodManagerProps> = ({ territories, onAdd, onDelete, isAdmin }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<Territory>>({
    neighborhood: '',
    street: '',
    number: '',
    block: '',
    lot: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.neighborhood || !formData.street) return;
    
    onAdd({
      ...formData as Territory,
      id: Math.random().toString(36).substr(2, 9)
    });
    
    setFormData({ neighborhood: '', street: '', number: '', block: '', lot: '', notes: '' });
    setIsFormOpen(false);
  };

  const filtered = territories.filter(t => 
    t.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.block.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header do Módulo */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Bairros e Logradouros</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Gestão de endereços e zoneamento urbano</p>
          </div>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64 group">
            <svg className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Pesquisar..." 
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-600 font-bold transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Tooltip text="Pesquisar por Bairro ou Rua" />
          </div>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
            Novo Bairro
          </button>
        </div>
      </div>

      {/* Grid de Bairros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map(t => (
          <div key={t.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all group relative overflow-hidden h-full flex flex-col">
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 group-hover:bg-indigo-50 transition-colors"></div>
            
            <div className="relative z-10 flex-1">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg uppercase tracking-widest border border-indigo-100">Cód: {t.id.slice(-4).toUpperCase()}</span>
                {isAdmin && (
                  <div className="group relative">
                    <button onClick={() => onDelete(t.id)} className="text-slate-300 hover:text-red-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                    <Tooltip text="Excluir Endereço" />
                  </div>
                )}
              </div>
              
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Logradouro Principal</h4>
              <p className="text-lg font-black text-slate-900 tracking-tighter leading-tight mb-4 group-hover:text-indigo-600 transition-colors">{t.street}, {t.number || 'S/N'}</p>
              
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                <span className="text-xs font-black text-slate-700 uppercase">{t.neighborhood}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-auto">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Quadra</span>
                  <span className="text-xs font-black text-slate-900 uppercase">{t.block || '-'}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Lote</span>
                  <span className="text-xs font-black text-slate-900 uppercase">{t.lot || '-'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {filtered.length === 0 && (
          <div className="col-span-full py-24 flex flex-col items-center justify-center bg-white rounded-[3rem] border-4 border-dashed border-slate-100">
            <svg className="w-16 h-16 text-slate-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <p className="text-lg font-black text-slate-300 uppercase tracking-widest">Nenhum endereço catalogado</p>
          </div>
        )}
      </div>

      {/* Modal de Cadastro */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
          <form onSubmit={handleSubmit} className="bg-white w-full max-w-xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <header className="px-10 py-8 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Zoneamento Urbano</span>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mt-1">Cadastrar Endereço</h3>
              </div>
              <button type="button" onClick={() => setIsFormOpen(false)} className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-red-600 transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </header>
            
            <div className="p-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nome do Bairro</label>
                  <input required type="text" value={formData.neighborhood} onChange={e => setFormData({...formData, neighborhood: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold focus:border-indigo-600 outline-none transition-all" placeholder="Ex: Centro" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Logradouro (Rua / Av)</label>
                  <input required type="text" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold focus:border-indigo-600 outline-none transition-all" placeholder="Ex: Av. Independência" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Número</label>
                  <input type="text" value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold focus:border-indigo-600 outline-none transition-all" placeholder="123" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Quadra</label>
                    <input type="text" value={formData.block} onChange={e => setFormData({...formData, block: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold focus:border-indigo-600 outline-none transition-all" placeholder="Q-02" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Lote</label>
                    <input type="text" value={formData.lot} onChange={e => setFormData({...formData, lot: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold focus:border-indigo-600 outline-none transition-all" placeholder="L-05" />
                  </div>
                </div>
              </div>
            </div>

            <footer className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex gap-4">
              <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 py-4 text-slate-500 font-black uppercase text-xs tracking-widest">Cancelar</button>
              <button type="submit" className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-500 transition-all">Salvar Endereço</button>
            </footer>
          </form>
        </div>
      )}
    </div>
  );
};

export default NeighborhoodManager;
