
import React from 'react';
import { AuditLog } from '../types';

interface LogsViewProps {
  logs: AuditLog[];
}

const LogsView: React.FC<LogsViewProps> = ({ logs }) => {
  const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CRIAR': return 'text-emerald-600 bg-emerald-50';
      case 'EDITAR': return 'text-blue-600 bg-blue-50';
      case 'EXCLUIR': return 'text-red-600 bg-red-50';
      case 'LOGIN': return 'text-purple-600 bg-purple-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-500">
      <div className="p-6 border-b flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Logs de Auditoria</h3>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Rastreabilidade Completa de Ações</p>
        </div>
        <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full uppercase tracking-widest">
          {logs.length} Registros
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-bold text-slate-600 text-[10px] uppercase tracking-wider">Data / Horário</th>
              <th className="px-6 py-4 font-bold text-slate-600 text-[10px] uppercase tracking-wider">Agente</th>
              <th className="px-6 py-4 font-bold text-slate-600 text-[10px] uppercase tracking-wider">Ação</th>
              <th className="px-6 py-4 font-bold text-slate-600 text-[10px] uppercase tracking-wider">Alvo / Descrição</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sortedLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-slate-700">
                    {new Date(log.timestamp).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold">
                    {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-slate-800">{log.agentName}</div>
                  <div className="text-[9px] text-slate-400 uppercase tracking-widest">ID: {log.agentId}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getActionColor(log.action)}`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-700">
                    <span className="font-bold text-slate-400 uppercase text-[9px] tracking-tighter mr-1">[{log.targetType}]</span>
                    {log.targetName}
                  </div>
                </td>
              </tr>
            ))}
            {sortedLogs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-20 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <p className="text-slate-400 font-medium">Nenhuma atividade registrada ainda.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LogsView;
