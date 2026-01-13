
import { Person, Agent, Institution, AgentRole, RelationshipType, AuditLog, Territory, SystemMode, BackupBundle } from "../types";

/**
 * Indexador e Corretor de Dados:
 * Varre as coleções em busca de falhas estruturais, campos nulos ou IDs ausentes.
 */
export const runDataIndexer = (bundle: Partial<BackupBundle>): BackupBundle => {
  const correctedBundle: BackupBundle = {
    version: "2.5", // Versão atualizada do esquema
    timestamp: new Date().toISOString(),
    institution: bundle.institution ? {
      ...bundle.institution,
      city: bundle.institution.city || 'Não Informada',
      systemMode: bundle.institution.systemMode || SystemMode.SERVER,
      cnpj: bundle.institution.cnpj || '00.000.000/0001-00'
    } : { 
      name: 'Prefeitura Municipal', 
      logoUrl: 'https://placehold.co/100x100/2563eb/white?text=LOGO', 
      cnpj: '00.000.000/0001-00', 
      city: 'Sede Central',
      systemMode: SystemMode.SERVER 
    },
    agents: (bundle.agents || []).map(agent => ({
      ...agent,
      id: agent.id || Math.random().toString(36).substr(2, 9),
      role: agent.role || AgentRole.OPERATOR,
      name: agent.name || "Agente Operacional",
      username: agent.username || `agente.${Math.random().toString(36).substr(2, 4)}`
    })),
    residents: (bundle.residents || []).map(res => ({
      ...res,
      id: res.id || Math.random().toString(36).substr(2, 9),
      name: res.name || "Morador Não Identificado",
      relationship: res.relationship || RelationshipType.OTHER,
      cpf: res.cpf || "000.000.000-00",
      rg: res.rg || "",
      neighborhood: res.neighborhood || "Bairro Não Informado",
      birthDate: res.birthDate || new Date().toISOString().split('T')[0],
      education: res.education || { isStudying: false, schoolName: '', grade: '' }
    })),
    logs: (bundle.logs || []).slice(0, 1000), // Mantém apenas os últimos 1000 logs para performance
    territories: (bundle.territories || []).map(t => ({
      ...t,
      id: t.id || Math.random().toString(36).substr(2, 9),
      neighborhood: t.neighborhood || "Geral"
    }))
  };

  return correctedBundle;
};

export const exportBackup = (bundle: BackupBundle) => {
  const dataStr = JSON.stringify(bundle, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  const exportFileDefaultName = `gestao_publica_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

export const importBackup = async (file: File): Promise<BackupBundle> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        const validated = runDataIndexer(json);
        resolve(validated);
      } catch (err) {
        reject(new Error("Arquivo de backup inválido ou corrompido. Certifique-se de que é um JSON válido do sistema."));
      }
    };
    reader.onerror = () => reject(new Error("Erro físico ao ler o arquivo de disco."));
    reader.readAsText(file);
  });
};
