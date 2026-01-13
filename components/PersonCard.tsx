
import React, { useState, useRef, useEffect } from 'react';
import { Person, RelationshipType } from '../types';

interface PersonCardProps {
  person: Person;
  onEdit: (person: Person) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

const PersonCard: React.FC<PersonCardProps> = ({ person, onEdit, onDelete, isAdmin }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsMenuOpen(false);
    };
    if (isMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const getAge = (dateStr: string) => {
    try {
      if (!dateStr) return 0;
      const birth = new Date(dateStr);
      if (isNaN(birth.getTime())) return 0;
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      return age;
    } catch (e) {
      return 0;
    }
  };

  const age = getAge(person.birthDate);

  const getRelationshipColors = (type: RelationshipType) => {
    switch (type) {
      case RelationshipType.HEAD: return "bg-indigo-600 text-white shadow-indigo-100";
      case RelationshipType.SPOUSE: return "bg-indigo-100 text-indigo-800";
      case RelationshipType.CHILD: return "bg-emerald-100 text-emerald-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 p-7 shadow-sm hover:shadow-2xl hover:border-indigo-400 transition-all duration-500 relative flex flex-col h-full group">
      {/* Menu Kebab Superior */}
      <div className="absolute top-7 right-7 z-20" ref={menuRef}>
         <div className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className={`p-2.5 rounded-xl transition-all shadow-sm border flex items-center justify-center ${isMenuOpen ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-400 hover:bg-white hover:text-indigo-600 border-slate-100'}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            
            {isMenuOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-100 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] py-3 z-50 animate-in zoom-in-95 slide-in-from-top-2 duration-300">
                <button 
                  onClick={() => { onEdit(person); setIsMenuOpen(false); }} 
                  className="w-full px-5 py-3.5 text-left text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-3"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  Editar Dados
                </button>
                {isAdmin && (
                  <button 
                    onClick={() => { setIsMenuOpen(false); if(window.confirm('Excluir permanentemente?')) onDelete(person.id); }} 
                    className="w-full px-5 py-3.5 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-3"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    Remover Cadastro
                  </button>
                )}
              </div>
            )}
         </div>
      </div>

      {/* Avatar e Nome */}
      <div className="flex items-center gap-5 mb-8">
        <div className="w-16 h-16 bg-slate-50 rounded-[1.3rem] flex items-center justify-center text-indigo-600 font-black text-2xl border-2 border-slate-100 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shrink-0">
          {person.name.charAt(0)}
        </div>
        <div className="overflow-hidden">
          <h4 className="text-xl font-black text-slate-900 tracking-tighter truncate leading-tight pr-12" title={person.name}>{person.name}</h4>
          <span className={`inline-block mt-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${getRelationshipColors(person.relationship)}`}>
            {person.relationship}
          </span>
        </div>
      </div>

      {/* Info Principal */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">CPF</span>
          <span className="text-xs font-mono font-bold text-slate-700">{person.cpf || '---'}</span>
        </div>
        <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Idade</span>
          <span className="text-xs font-bold text-slate-700">{age} Anos</span>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
          </div>
          <div>
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Bairro / Setor</p>
             <p className="text-xs font-bold text-slate-700 truncate">{person.neighborhood || 'N/D'}</p>
          </div>
        </div>

        {person.phone && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            </div>
            <div className="flex-1">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Telefone</p>
               <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">{person.phone}</span>
                <a 
                  href={`tel:${person.phone.replace(/\D/g, '')}`} 
                  className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                  title="Realizar Chamada"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </a>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Botões de Ação Direta */}
      <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-3">
         <button 
           onClick={() => onEdit(person)}
           className="flex-1 bg-slate-950 text-white text-[10px] font-black uppercase tracking-widest py-3.5 rounded-xl hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
         >
           Ver Ficha
         </button>
         <button 
           onClick={() => onEdit(person)}
           className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-indigo-600 hover:border-indigo-600 transition-all"
           title="Editar Registro"
         >
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
         </button>
      </div>
    </div>
  );
};

export default PersonCard;
