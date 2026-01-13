
import React, { useState, useMemo } from 'react';
import { Person, RelationshipType, ReportConfig } from '../types';
import { exportToPDF, exportToCSV } from '../services/exportService';

interface ReportsProps {
  residents: Person[];
  institutionName?: string;
}

const initialFilters = {
  globalSearch: '',
  rg: '',
  neighborhood: '',
  street: '',
  school: '',
  isStudying: 'all',
  gender: 'all',
  civilStatus: 'all',
  minAge: '',
  maxAge: ''
};

const allColumns = [
  { id: 'name', label: 'Nome Completo', category: 'Identificação' },
  { id: 'cpf', label: 'CPF', category: 'Documentos' },
  { id: 'rg', label: 'RG', category: 'Documentos' },
  { id: 'age', label: 'Idade', category: 'Perfil' },
  { id: 'relationship', label: 'Parentesco', category: 'Perfil' },
  { id: 'neighborhood', label: 'Bairro', category: 'Localização' },
  { id: 'street', label: 'Logradouro', category: 'Localização' },
  { id: 'education', label: 'Escolaridade', category: 'Educação' },
  { id: 'phone', label: 'Telefone', category: 'Contato' }
];

const Reports: React.FC<ReportsProps> = ({ residents, institutionName = "Instituição Pública" }) => {
  const [filters, setFilters] = useState(initialFilters);
  const [activeTab, setActiveTab] = useState<'geral' | 'familia' | 'local' | 'perfil' | 'educacao'>('geral');
  const [reportConfig] = useState<ReportConfig>({
    visibleColumns: ['name', 'cpf', 'relationship', 'neighborhood', 'education']
  });

  const getAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const filteredData = useMemo(() => {
    return residents.filter(p => {
      const age = getAge(p.birthDate);
      const matchesGlobal = !filters.globalSearch || 
        p.name.toLowerCase().includes(filters.globalSearch.toLowerCase()) || 
        (p.cpf && p.cpf.includes(filters.globalSearch));
      
      const matchesRg = !filters.rg || (p.rg && p.rg.toLowerCase().includes(filters.rg.toLowerCase()));
      const matchesNeighborhood = !filters.neighborhood || p.neighborhood?.toLowerCase().includes(filters.neighborhood.toLowerCase());
      const matchesStreet = !filters.street || p.street?.toLowerCase().includes(filters.street.toLowerCase());
      const matchesSchool = !filters.school || p.education?.schoolName?.toLowerCase().includes(filters.school.toLowerCase());
      
      const matchesStudying = filters.isStudying === 'all' || 
        (filters.isStudying === 'yes' && p.education?.isStudying) || 
        (filters.isStudying === 'no' && !p.education?.isStudying);
      
      const matchesGender = filters.gender === 'all' || p.gender === filters.gender;
      const matchesAge = (!filters.minAge || age >= parseInt(filters.minAge)) && (!filters.maxAge || age <= parseInt(filters.maxAge));
      
      return matchesGlobal && matchesRg && matchesNeighborhood && matchesStreet && matchesSchool && matchesStudying && matchesGender && matchesAge;
    });
  }, [residents, filters]);

  const familyUnits = useMemo(() => {
    const groups: Record<string, { address: string, members: Person[] }> = {};
    
    filteredData.forEach(p => {
      const addrKey = `${p.neighborhood || 'SN'}-${p.street || 'SN'}-${p.block || 'SN'}-${p.lot || 'SN'}`.toLowerCase();
      if (!groups[addrKey]) {
        groups[addrKey] = {
          address: `${p.street || 'Logradouro não informado'}, ${p.number ? 'Nº ' + p.number : 'S/N'} - Qd ${p.block || '-'}, Lt ${p.lot || '-'} (${p.neighborhood || 'Bairro N/D'})`,
          members: []
        };
      }
      groups[addrKey].members.push(p);
    });

    return Object.values(groups).sort((a, b) => b.members.length - a.members.length);
  }, [filteredData]);

  const stats = useMemo(() => {
    const count = filteredData.length;
    if (count === 0) return { avgAge: 0, students: 0, heads: 0, percentage: 0 };
    
    const sumAge = filteredData.reduce((acc, p) => acc + getAge(p.birthDate), 0);
    const students = filteredData.filter(p => p.education?.isStudying).length;
    const heads = filteredData.filter(p => p.relationship === RelationshipType.HEAD).length;
    const percentage = Math.round((count / (residents.length || 1)) * 100);
    
    return {
      avgAge: Math.round(sumAge / count),
      students,
      heads,
      percentage
    };
  }, [filteredData, residents.length]);

  const handleFilterChange = (field: keyof typeof initialFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const TabButton = ({ id, label, icon }: { id: typeof activeTab, label: string, icon: React.ReactNode }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100'}`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-500">
      {/* Header Analítico */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-8 no-print">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-slate-950 rounded-3xl flex items-center justify-center text-white shadow-2xl">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 17v-2m3 2v-4m3 2v-6m-8 13h10a2 2 0 002-2V5a2 2 0 00-2-2H9a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Módulo Analítico</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Análise de dados territoriais e familiares</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 justify-center md:justify-end">
          <button onClick={() => window.print()} className="flex items-center gap-3 bg-slate-100 text-slate-700 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Imprimir
          </button>
          <button onClick={() => exportToCSV(filteredData)} className="flex items-center gap-3 bg-emerald-600 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl">
            CSV
          </button>
          <button onClick={() => exportToPDF(filteredData, institutionName)} className="flex items-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl">
            PDF
          </button>
        </div>
      </div>

      {/* Painel de Filtros Avançados */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-6 no-print">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
             </div>
             <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Filtros Avançados</h3>
           </div>
           <button 
             onClick={() => setFilters(initialFilters)} 
             className="flex items-center gap-2 text-[10px] font-black text-red-600 uppercase tracking-widest px-4 py-2 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
           >
             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
             Limpar Filtros
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome / CPF</label>
            <input 
              type="text" 
              value={filters.globalSearch} 
              onChange={e => handleFilterChange('globalSearch', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-indigo-600 transition-all" 
              placeholder="Pesquisar..."
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Bairro</label>
            <input 
              type="text" 
              value={filters.neighborhood} 
              onChange={e => handleFilterChange('neighborhood', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-indigo-600 transition-all" 
              placeholder="Filtrar bairro..."
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Estudante?</label>
            <select 
              value={filters.isStudying} 
              onChange={e => handleFilterChange('isStudying', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-indigo-600 transition-all"
            >
              <option value="all">Todos</option>
              <option value="yes">Sim</option>
              <option value="no">Não</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Idade Mínima</label>
            <input 
              type="number" 
              value={filters.minAge} 
              onChange={e => handleFilterChange('minAge', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-indigo-600 transition-all" 
              placeholder="0"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Idade Máxima</label>
            <input 
              type="number" 
              value={filters.maxAge} 
              onChange={e => handleFilterChange('maxAge', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-indigo-600 transition-all" 
              placeholder="120"
            />
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 no-print">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Cidadãos Filtrados</span>
          <span className="text-3xl font-black text-slate-900">{filteredData.length}</span>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Famílias</span>
          <span className="text-3xl font-black text-indigo-600">{familyUnits.length}</span>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Estudantes Ativos</span>
          <span className="text-3xl font-black text-emerald-600">{stats.students}</span>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Idade Média</span>
          <span className="text-3xl font-black text-amber-600">{stats.avgAge}</span>
        </div>
      </div>

      {/* Seção de Visualização Principal */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-100 pb-8 no-print">
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <TabButton id="geral" label="Lista Geral" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" /></svg>} />
            <TabButton id="familia" label="Relação Familiar" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
            <TabButton id="local" label="Território" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>} />
            <TabButton id="perfil" label="Demografia" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} />
            <TabButton id="educacao" label="Educação" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /></svg>} />
          </div>
        </div>

        {activeTab === 'familia' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
            {familyUnits.map((family, idx) => {
              const head = family.members.find(m => m.relationship === RelationshipType.HEAD);
              const dependents = family.members.filter(m => m.relationship !== RelationshipType.HEAD);
              const minorsInFamily = family.members.filter(m => getAge(m.birthDate) < 18).length;

              return (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-[2.5rem] p-8 hover:border-indigo-400 transition-all group flex flex-col h-full">
                  <header className="flex justify-between items-start mb-8">
                    <div className="max-w-[70%]">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Núcleo Familiar</h4>
                      <p className="text-xs font-bold text-slate-900 uppercase leading-tight">{family.address}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                       <div className="bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm text-center">
                        <span className="block text-xl font-black text-indigo-600">{family.members.length}</span>
                        <span className="text-[8px] font-black text-slate-400 uppercase">Membros</span>
                      </div>
                      {minorsInFamily > 0 && (
                        <div className="bg-amber-100 px-4 py-1.5 rounded-xl text-center border border-amber-200">
                          <span className="block text-[10px] font-black text-amber-700 uppercase tracking-tighter">{minorsInFamily} Menores</span>
                        </div>
                      )}
                    </div>
                  </header>

                  <div className="space-y-4 flex-1">
                    <div className="bg-white p-6 rounded-2xl border-l-4 border-indigo-600 shadow-sm transition-transform group-hover:translate-x-1">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">Titular</span>
                        <span className="text-[9px] font-bold text-slate-400">{head?.cpf || 'CPF NÃO INFORMADO'}</span>
                      </div>
                      <p className="font-black text-slate-900 uppercase text-sm">{head?.name || '--- SEM TITULAR ---'}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{head ? getAge(head.birthDate) + ' Anos' : ''}</p>
                    </div>

                    {dependents.length > 0 ? (
                      <div className="pl-4 border-l-2 border-slate-200 space-y-3">
                        {dependents.map((dep, dIdx) => (
                          <div key={dIdx} className="flex justify-between items-center bg-white/40 p-4 rounded-xl border border-slate-100">
                            <div>
                              <p className="text-xs font-black text-slate-800 uppercase">{dep.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase">{dep.relationship}</span>
                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase">{getAge(dep.birthDate)} Anos</span>
                              </div>
                            </div>
                            {getAge(dep.birthDate) < 18 && (
                               <span className="bg-amber-100 text-amber-700 text-[8px] font-black px-2 py-1 rounded-lg uppercase">Menor</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-4 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                         <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Nenhum dependente vinculado</span>
                      </div>
                    )}
                  </div>

                  <footer className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z" /></svg>
                       </div>
                       <div>
                         <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Estudantes</span>
                         <span className="text-xs font-black text-emerald-600">{family.members.filter(m => m.education?.isStudying).length} ativos</span>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                       </div>
                       <div>
                         <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Adultos</span>
                         <span className="text-xs font-black text-indigo-600">{family.members.length - minorsInFamily} membros</span>
                       </div>
                    </div>
                  </footer>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
            {filteredData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b-2 border-slate-100">
                    <tr>
                      {allColumns.filter(c => reportConfig.visibleColumns.includes(c.id)).map(col => (
                        <th key={col.id} className="px-8 py-6 font-black text-slate-900 text-[10px] uppercase tracking-[0.2em]">{col.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredData.map(p => (
                      <tr key={p.id} className="hover:bg-indigo-50/20 transition-colors">
                        {reportConfig.visibleColumns.includes('name') && <td className="px-8 py-6 text-sm font-black text-slate-900 uppercase">{p.name}</td>}
                        {reportConfig.visibleColumns.includes('cpf') && <td className="px-8 py-6 text-xs font-mono font-bold text-slate-500">{p.cpf}</td>}
                        {reportConfig.visibleColumns.includes('rg') && <td className="px-8 py-6 text-xs font-mono font-bold text-slate-500">{p.rg || '-'}</td>}
                        {reportConfig.visibleColumns.includes('age') && <td className="px-8 py-6 text-xs font-bold text-slate-700">{getAge(p.birthDate)} Anos</td>}
                        {reportConfig.visibleColumns.includes('relationship') && <td className="px-8 py-6"><span className="text-[10px] font-black uppercase bg-slate-100 px-3 py-1 rounded-lg">{p.relationship}</span></td>}
                        {reportConfig.visibleColumns.includes('neighborhood') && <td className="px-8 py-6 text-xs font-bold text-slate-700 uppercase">{p.neighborhood}</td>}
                        {reportConfig.visibleColumns.includes('street') && <td className="px-8 py-6 text-xs font-bold text-slate-500">{p.street || '-'}</td>}
                        {reportConfig.visibleColumns.includes('education') && (
                          <td className="px-8 py-6">
                            <span className={`text-[10px] font-black uppercase ${p.education?.isStudying ? 'text-emerald-600' : 'text-slate-300'}`}>
                              {p.education?.isStudying ? 'Estudante' : 'Inativo'}
                            </span>
                          </td>
                        )}
                        {reportConfig.visibleColumns.includes('phone') && <td className="px-8 py-6 text-xs font-bold text-slate-700">{p.phone || '-'}</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <h4 className="text-xl font-black text-slate-300 uppercase tracking-tighter">Nenhum registro encontrado</h4>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
