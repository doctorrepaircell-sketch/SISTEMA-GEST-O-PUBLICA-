
import React, { useState, useEffect } from 'react';
import { Person, RelationshipType, CivilStatus } from '../types';

interface PersonFormProps {
  onSubmit: (person: Person) => void;
  onCancel: () => void;
  initialData?: Person | null;
  isHeadAlreadySet: boolean;
}

const InputSection = ({ title, icon, children }: { title: string, icon: React.ReactNode, children?: React.ReactNode }) => (
  <div className="space-y-6">
    <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">{icon}</div>
      <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">{title}</h4>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
  </div>
);

const PersonForm: React.FC<PersonFormProps> = ({ onSubmit, onCancel, initialData, isHeadAlreadySet }) => {
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [isReadOnly, setIsReadOnly] = useState(false);
  
  const [formData, setFormData] = useState<Person>({
    id: '',
    name: '',
    birthDate: '',
    relationship: '' as any, // Iniciado como vazio para forçar seleção
    gender: 'Masculino',
    cpf: '',
    rg: '',
    civilStatus: CivilStatus.SINGLE,
    email: '',
    phone: '',
    generalObservations: '',
    street: '',
    number: '',
    neighborhood: '',
    city: 'Cidade Local',
    state: 'UF',
    block: '',
    lot: '',
    education: {
      isStudying: false,
      schoolName: '',
      grade: '',
      reasonNotStudying: ''
    }
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        email: initialData.email || '',
        phone: initialData.phone || '',
        generalObservations: initialData.generalObservations || '',
        rg: initialData.rg || '',
        street: initialData.street || '',
        number: initialData.number || '',
        neighborhood: initialData.neighborhood || '',
        civilStatus: initialData.civilStatus || CivilStatus.SINGLE
      });
      setIsReadOnly(true);
    } else if (!isHeadAlreadySet) {
      setFormData(p => ({ ...p, relationship: RelationshipType.HEAD }));
      setIsReadOnly(false);
    }
  }, [initialData, isHeadAlreadySet]);

  const validate = (): boolean => {
    const newErrors = new Set<string>();
    
    // Validação de Campos Obrigatórios
    if (!formData.name.trim() || formData.name.trim().length < 3) newErrors.add('name');
    if (!formData.cpf.trim() || formData.cpf.replace(/\D/g, '').length < 11) newErrors.add('cpf');
    if (!formData.birthDate) newErrors.add('birthDate');
    if (!formData.relationship) newErrors.add('relationship');
    
    // Validação adicional para Titular (Endereço obrigatório)
    if (formData.relationship === RelationshipType.HEAD) {
      if (!formData.street?.trim()) newErrors.add('street');
      if (!formData.neighborhood?.trim()) newErrors.add('neighborhood');
    }

    setErrors(newErrors);
    
    if (newErrors.size > 0) {
      // Faz scroll para o primeiro erro para feedback imediato
      const firstError = document.querySelector('.border-red-500');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return newErrors.size === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    // Remove o erro assim que o usuário começa a digitar
    if (errors.has(field)) {
      const newErrors = new Set(errors);
      newErrors.delete(field);
      setErrors(newErrors);
    }

    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...(prev[parent as keyof Person] as any), [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    if (validate()) {
      onSubmit({ ...formData, id: initialData?.id || Math.random().toString(36).substr(2, 9) });
    }
  };

  const isHead = formData.relationship === RelationshipType.HEAD;

  return (
    <div className="bg-white rounded-[3.5rem] overflow-hidden flex flex-col h-full max-h-[90vh] shadow-2xl">
      <header className="px-12 py-10 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-6">
          <button onClick={onCancel} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 transition-all hover:scale-110">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Protocolo Territorial</span>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mt-1">
              {isReadOnly ? 'Ficha do Morador' : (initialData ? 'Atualizar Dados' : 'Novo Registro')}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isReadOnly && (
             <button 
              type="button"
              onClick={() => setIsReadOnly(false)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-indigo-500 transition-all"
            >
              Habilitar Edição
            </button>
          )}
          <button onClick={onCancel} className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-red-600 transition-all shadow-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-12 py-12 space-y-16 custom-scrollbar">
        {/* Aviso de Erro Geral */}
        {errors.size > 0 && (
          <div className="bg-red-50 border-2 border-red-100 p-6 rounded-[2rem] mb-8 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-500 text-white rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <div>
                <p className="text-sm font-black text-red-700 uppercase tracking-tight">Campos Obrigatórios Pendentes</p>
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-0.5">Por favor, preencha os campos destacados em vermelho abaixo.</p>
              </div>
            </div>
          </div>
        )}

        <InputSection title="Dados Civis" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}>
          <div className="md:col-span-2">
            <label className={`text-[10px] font-black uppercase tracking-widest ml-1 mb-2 block transition-colors ${errors.has('name') ? 'text-red-600' : 'text-slate-400'}`}>
              Nome Completo * {errors.has('name') && <span className="text-[8px] font-bold">(Obrigatório / Mínimo 3 letras)</span>}
            </label>
            <input 
              type="text" 
              readOnly={isReadOnly}
              value={formData.name} 
              onChange={e => handleInputChange('name', e.target.value)} 
              placeholder="Digite o nome completo"
              className={`w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl font-bold outline-none transition-all ${isReadOnly ? 'cursor-default opacity-80' : ''} ${errors.has('name') ? 'border-red-500 bg-red-50/30' : 'border-slate-50 focus:border-indigo-600'}`} 
            />
          </div>
          <div>
            <label className={`text-[10px] font-black uppercase tracking-widest ml-1 mb-2 block transition-colors ${errors.has('relationship') ? 'text-red-600' : 'text-slate-400'}`}>
              Grau de Parentesco * {errors.has('relationship') && <span className="text-[8px] font-bold">(Obrigatório)</span>}
            </label>
            <select 
              value={formData.relationship || ""} 
              disabled={isReadOnly || (!!initialData && isHead)} 
              onChange={e => handleInputChange('relationship', e.target.value as RelationshipType)} 
              className={`w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl font-bold outline-none transition-all ${isReadOnly ? 'opacity-80' : ''} ${errors.has('relationship') ? 'border-red-500 bg-red-50/30' : 'border-slate-50 focus:border-indigo-600'}`}
            >
              <option value="" disabled>Selecione o parentesco...</option>
              {Object.values(RelationshipType).map(t => (
                <option key={t} value={t} disabled={t === RelationshipType.HEAD && isHeadAlreadySet && !isHead}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={`text-[10px] font-black uppercase tracking-widest ml-1 mb-2 block transition-colors ${errors.has('cpf') ? 'text-red-600' : 'text-slate-400'}`}>
              CPF * {errors.has('cpf') && <span className="text-[8px] font-bold">(Mínimo 11 dígitos)</span>}
            </label>
            <input 
              type="text" 
              readOnly={isReadOnly}
              value={formData.cpf} 
              onChange={e => handleInputChange('cpf', e.target.value)} 
              className={`w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl font-bold outline-none transition-all ${isReadOnly ? 'cursor-default opacity-80' : ''} ${errors.has('cpf') ? 'border-red-500 bg-red-50/30' : 'border-slate-50 focus:border-indigo-600'}`} 
              placeholder="000.000.000-00" 
            />
          </div>
          <div>
            <label className={`text-[10px] font-black uppercase tracking-widest ml-1 mb-2 block transition-colors ${errors.has('birthDate') ? 'text-red-600' : 'text-slate-400'}`}>
              Data de Nascimento * {errors.has('birthDate') && <span className="text-[8px] font-bold">(Obrigatório)</span>}
            </label>
            <input 
              type="date" 
              readOnly={isReadOnly}
              value={formData.birthDate} 
              onChange={e => handleInputChange('birthDate', e.target.value)} 
              className={`w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl font-bold outline-none transition-all ${isReadOnly ? 'opacity-80' : ''} ${errors.has('birthDate') ? 'border-red-500 bg-red-50/30' : 'border-slate-50 focus:border-indigo-600'}`}
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Estado Civil</label>
            <select 
              value={formData.civilStatus} 
              disabled={isReadOnly}
              onChange={e => handleInputChange('civilStatus', e.target.value as CivilStatus)} 
              className={`w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none ${isReadOnly ? 'opacity-80' : ''}`}
            >
              {Object.values(CivilStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </InputSection>

        <InputSection title="Localização Residencial" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>}>
          <div className="md:col-span-2">
            <label className={`text-[10px] font-black uppercase tracking-widest ml-1 mb-2 block transition-colors ${isHead && errors.has('street') ? 'text-red-600' : 'text-slate-400'}`}>
              Logradouro (Rua/Av) {isHead && '*'} {isHead && errors.has('street') && <span className="text-[8px] font-bold">(Obrigatório para Titular)</span>}
            </label>
            <input 
              type="text" 
              readOnly={isReadOnly}
              value={formData.street} 
              onChange={e => handleInputChange('street', e.target.value)} 
              placeholder="Rua, Avenida, Travessa..."
              className={`w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl font-bold outline-none transition-all ${isReadOnly ? 'opacity-80' : ''} ${isHead && errors.has('street') ? 'border-red-500 bg-red-50/30' : 'border-slate-50 focus:border-indigo-600'}`} 
            />
          </div>
          <div>
            <label className={`text-[10px] font-black uppercase tracking-widest ml-1 mb-2 block transition-colors ${isHead && errors.has('neighborhood') ? 'text-red-600' : 'text-slate-400'}`}>
              Bairro {isHead && '*'} {isHead && errors.has('neighborhood') && <span className="text-[8px] font-bold">(Obrigatório para Titular)</span>}
            </label>
            <input 
              type="text" 
              readOnly={isReadOnly}
              value={formData.neighborhood} 
              onChange={e => handleInputChange('neighborhood', e.target.value)} 
              placeholder="Nome do bairro"
              className={`w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl font-bold outline-none transition-all ${isReadOnly ? 'opacity-80' : ''} ${isHead && errors.has('neighborhood') ? 'border-red-500 bg-red-50/30' : 'border-slate-50 focus:border-indigo-600'}`} 
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
             <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Número</label>
                <input type="text" readOnly={isReadOnly} value={formData.number} onChange={e => handleInputChange('number', e.target.value)} className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none" placeholder="123" />
             </div>
             <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Quadra</label>
                <input type="text" readOnly={isReadOnly} value={formData.block} onChange={e => handleInputChange('block', e.target.value)} className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none" placeholder="Q-01" />
             </div>
             <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Lote</label>
                <input type="text" readOnly={isReadOnly} value={formData.lot} onChange={e => handleInputChange('lot', e.target.value)} className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none" placeholder="L-05" />
             </div>
          </div>
        </InputSection>

        <InputSection title="Educação e Contato" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 14l9-5-9-5-9 5 9 5z" /></svg>}>
           <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Vínculo Escolar Ativo?</label>
              <div className="flex gap-4">
                <button 
                  type="button" 
                  disabled={isReadOnly}
                  onClick={() => handleInputChange('education.isStudying', true)}
                  className={`flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest border-2 transition-all ${formData.education?.isStudying ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-slate-50 border-slate-50 text-slate-400'}`}
                >Sim</button>
                <button 
                  type="button" 
                  disabled={isReadOnly}
                  onClick={() => handleInputChange('education.isStudying', false)}
                  className={`flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest border-2 transition-all ${!formData.education?.isStudying ? 'bg-red-500 border-red-500 text-white' : 'bg-slate-50 border-slate-50 text-slate-400'}`}
                >Não</button>
              </div>
           </div>
           <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Telefone de Contato</label>
              <input type="text" readOnly={isReadOnly} value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none" placeholder="(00) 00000-0000" />
           </div>
        </InputSection>
      </form>

      <footer className="px-12 py-10 border-t border-slate-100 bg-slate-50 shrink-0 flex gap-6 no-print">
        <button type="button" onClick={onCancel} className="flex-1 py-5 border-2 border-slate-200 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white transition-all">
          {isReadOnly ? 'Sair da Visualização' : 'Descartar Alterações'}
        </button>
        {!isReadOnly && (
          <button onClick={handleSubmit} className="flex-[2] py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-indigo-500 transition-all active:scale-95">
            Salvar Registro
          </button>
        )}
      </footer>
    </div>
  );
};

export default PersonForm;
