
import React, { useState, useEffect, useRef } from 'react';
import { Agent, AgentRole } from '../types';

interface AgentFormProps {
  onSubmit: (agent: Agent) => void;
  onCancel: () => void;
  initialData?: Agent | null;
}

const AgentForm: React.FC<AgentFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState<Agent>({
    id: '',
    name: '',
    cpf: '',
    email: '',
    username: '',
    password: '',
    avatarUrl: '',
    role: AgentRole.OPERATOR
  });

  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      id: initialData?.id || Math.random().toString(36).substr(2, 9)
    });
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-y-auto max-h-[90vh] text-slate-900">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-800">
            {initialData ? 'Editar Agente' : 'Novo Agente Público'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Credenciamento de Acesso</p>
        </div>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex flex-col items-center mb-6">
          <div className="relative group">
            <div className="w-24 h-24 bg-slate-100 rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 flex items-center justify-center shadow-inner">
              {formData.avatarUrl ? (
                <img src={formData.avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-xl shadow-lg hover:bg-blue-700 transition-all active:scale-90"
              title="Carregar foto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange}
            />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">Foto de Perfil</span>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Nome Completo</label>
          <input 
            required 
            type="text" 
            value={formData.name} 
            onChange={e => setFormData({ ...formData, name: e.target.value })} 
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold" 
            placeholder="Nome do servidor..."
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Nível de Acesso (Cargo)</label>
          <div className="grid grid-cols-2 gap-2">
            <button 
              type="button"
              onClick={() => setFormData({ ...formData, role: AgentRole.OPERATOR })}
              className={`py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${formData.role === AgentRole.OPERATOR ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-blue-200'}`}
            >
              Usuário Comum
            </button>
            <button 
              type="button"
              onClick={() => setFormData({ ...formData, role: AgentRole.ADMIN })}
              className={`py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${formData.role === AgentRole.ADMIN ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-indigo-200'}`}
            >
              Admin Master
            </button>
          </div>
          <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase tracking-tight leading-relaxed italic">
            {formData.role === AgentRole.ADMIN 
              ? "* Nível Master: Acesso total ao sistema, gestão de backups, logs e usuários." 
              : "* Usuário Comum: Acesso operacional para cadastros, edições e geração de relatórios."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">CPF</label>
            <input 
              required 
              type="text" 
              value={formData.cpf} 
              onChange={e => setFormData({ ...formData, cpf: e.target.value })} 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold" 
              placeholder="000.000.000-00"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Login</label>
            <input 
              required 
              type="text" 
              value={formData.username} 
              onChange={e => setFormData({ ...formData, username: e.target.value })} 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold" 
              placeholder="ex: maria.souza"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">E-mail Corporativo</label>
          <input 
            required 
            type="email" 
            value={formData.email} 
            onChange={e => setFormData({ ...formData, email: e.target.value })} 
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold" 
            placeholder="servidor@instituicao.gov.br"
          />
        </div>

        <div className="relative">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Senha de Acesso</label>
          <input 
            required={!initialData}
            type={showPassword ? "text" : "password"} 
            value={formData.password} 
            onChange={e => setFormData({ ...formData, password: e.target.value })} 
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold" 
            placeholder={initialData ? "Deixe em branco para manter" : "••••••••"}
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-[38px] text-slate-400 hover:text-slate-600"
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            )}
          </button>
        </div>

        <div className="flex gap-3 pt-4">
          <button 
            type="button" 
            onClick={onCancel} 
            className="flex-1 py-3.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-bold text-sm transition-all uppercase tracking-widest"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="flex-[1.5] bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-blue-100 transition-all active:scale-95"
          >
            {initialData ? 'Salvar Agente' : 'Cadastrar Agente'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AgentForm;
