
import React, { useState } from 'react';
import { Territory } from '../types';

interface TerritoryManagerProps {
  territories: Territory[];
  onAdd: (t: Territory) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

const TerritoryManager: React.FC<TerritoryManagerProps> = ({ territories, onAdd, onDelete, isAdmin }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<Territory>>({
    neighborhood: '',
    street: '',
    number: '',
    block: '',
    lot: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.neighborhood || !formData.street) return;
    
    onAdd({
      ...formData as Territory,
      id: Math.random().toString(36).substr(2, 9)
    });
    
    setFormData({ neighborhood: '', street: '', number: '', block: '', lot: '' });
    setIsFormOpen(false);
  };

  const filtered = territories.filter(t => 
    t.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.block.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-[32px] shadow-sm border border-slate-200">
        <div className="relative w-full max-w-lg">
          <svg className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input 
            type="text" 
            placeholder="Buscar por Bairro, Rua ou Quadra..." 
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none focus:border-blue-600 font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="w-full md:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 hover:bg-slate-800"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
          Mapear Logradouro
        </button>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl p-10 animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8">Cadastro Territorial</h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Bairro</label>
                <input required type="text" value={formData.neighborhood} onChange={e => setFormData({...formData, neighborhood: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-blue-600 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Logradouro (Rua/Av)</label>
                <input required type="text" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-blue-600 outline-none transition-all" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Número</label>
                  <input type="text" value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-blue-600 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Quadra</label>
                  <input type="text" value={formData.block} onChange={e => setFormData({...formData, block: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-blue-600 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Lote</label>
                  <input type="text" value={formData.lot} onChange={e => setFormData({...formData, lot: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-blue-600 outline-none transition-all" />
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 py-4 text-slate-500 font-black uppercase text-xs tracking-widest">Cancelar</button>
              <button type="submit" className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-100">Salvar Logradouro</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(t => (
          <div key={t.id} className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-slate-100 px-3 py-1 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Território ID: {t.id.toUpperCase()}
              </div>
              {isAdmin && (
                <button onClick={() => onDelete(t.id)} className="text-slate-300 hover:text-red-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              )}
            </div>
            <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-1">{t.street}, {t.number || 'S/N'}</h4>
            <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-4">{t.neighborhood}</p>
            
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-50">
              <div className="bg-slate-50 p-3 rounded-2xl">
                <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Quadra</span>
                <span className="text-sm font-black text-slate-800">{t.block || '-'}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl">
                <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Lote</span>
                <span className="text-sm font-black text-slate-800">{t.lot || '-'}</span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
             <p className="text-slate-400 font-black uppercase tracking-widest">Nenhum território mapeado para esta busca.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TerritoryManager;
