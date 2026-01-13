
export enum RelationshipType {
  HEAD = 'Titular',
  SPOUSE = 'Cônjuge',
  CHILD = 'Filho(a)',
  PARENT = 'Pai/Mãe',
  GRANDPARENT = 'Avô/Avó',
  GRANDCHILD = 'Neto(a)',
  SIBLING = 'Irmão/Irmã',
  UNCLE_AUNT = 'Tio(a)',
  NEPHEW_NIECE = 'Sobrinho(a)',
  STEPCHILD = 'Enteado(a)',
  OTHER = 'Outro'
}

export enum CivilStatus {
  SINGLE = 'Solteiro(a)',
  MARRIED = 'Casado(a)',
  DIVORCED = 'Divorciado(a)',
  WIDOWED = 'Viúvo(a)',
  STABLE_UNION = 'União Estável'
}

export enum AgentRole {
  ADMIN = 'Administrador (Master)',
  OPERATOR = 'Usuário Comum'
}

export enum SystemMode {
  SERVER = 'SERVIDOR_CENTRAL',
  STATION = 'ESTACAO_COLETA'
}

export interface ActivationKey {
  id: string;
  key: string;
  createdAt: string;
  status: 'Ativa' | 'Inativa';
}

export interface Territory {
  id: string;
  neighborhood: string;
  street: string;
  number: string;
  block: string;
  lot: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  agentId: string;
  agentName: string;
  action: 'CRIAR' | 'EDITAR' | 'EXCLUIR' | 'LOGIN' | 'LOGOUT' | 'BACKUP' | 'GERAR_CHAVE' | 'SINCRONIZAR';
  targetType: 'RESIDENTE' | 'AGENTE' | 'SISTEMA' | 'TERRITORIO' | 'LICENCA';
  targetName: string;
  timestamp: string;
}

export interface EducationInfo {
  isStudying: boolean;
  schoolName?: string;
  grade?: string;
  reasonNotStudying?: string;
}

export interface Person {
  id: string;
  name: string;
  birthDate: string;
  relationship: RelationshipType;
  gender: string;
  cpf: string;
  rg: string;
  civilStatus?: CivilStatus;
  email?: string;
  phone?: string;
  generalObservations?: string;
  address?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  block?: string;
  lot?: string;
  education?: EducationInfo;
}

export interface Agent {
  id: string;
  name: string;
  cpf: string;
  email: string;
  username: string;
  password?: string;
  avatarUrl?: string;
  role: AgentRole;
}

export interface Institution {
  name: string;
  logoUrl: string;
  cnpj: string;
  city: string;
  systemMode: SystemMode;
  developerName?: string;
  developerContact?: string;
  developerBio?: string;
}

export interface ReportConfig {
  visibleColumns: string[];
}

export interface BackupConfig {
  autoBackupEnabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  lastBackupDate?: string;
  remindMe: boolean;
}

export interface BackupBundle {
  version: string;
  timestamp: string;
  institution: Institution;
  agents: Agent[];
  residents: Person[];
  logs: AuditLog[];
  territories: Territory[];
  config?: BackupConfig;
}
