// Core entity types for the document signing platform

export type DocumentStatus = 'draft' | 'pending' | 'signed' | 'rejected';
export type SignatureStatus = 'pending' | 'signed' | 'rejected';
export type SignatureMethod = 'draw' | 'certificate' | 'typed';
export type SignatureType = 'pin' | 'cedula';
export type SignerType = 'signer' | 'approver'; // firmante o visador
export type TemplateType = 'template' | 'upload'; // plantilla con variables o subida directa de PDF
export type InstitutionType = 'personal' | 'organization';
export type UserRole = 'superadmin' | 'admin' | 'user';
export type InstitutionRole = 'Admin' | 'RRHH' | 'Trabajador' | 'Finanzas' | 'Legal' | 'Gerencia';

export interface Institution {
  id: string;
  name: string;
  type: InstitutionType;
  taxId?: string;
  apiKey?: string;
  allowedDomain?: string;
  primaryColor: string;
  logoUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserInstitutionRole {
  institutionId: string;
  role: InstitutionRole;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  institutionId: string; // Personal institution
  institutions: UserInstitutionRole[]; // All institutions with roles
  avatarUrl?: string;
  createdAt: Date;
}

export interface InstitutionUser {
  id: string;
  userId: string;
  institutionId: string;
  roles: InstitutionRole[]; // Multiple roles per user
  user: User;
  joinedAt: Date;
}

export interface Department {
  id: string;
  name: string;
  institutionId: string;
  permissions: string[];
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  institutionId: string;
}

// Document Template - reusable document structure
export interface DocumentTemplate {
  id: string;
  title: string;
  description: string;
  templateType: TemplateType;
  content: string;
  pdfUrl?: string; // For upload type templates
  category: string;
  tags: Tag[];
  institutionId: string;
  createdBy: string;
  variables: DocumentVariable[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Document Signer - people who need to sign
export interface DocumentSigner {
  id: string;
  documentId: string;
  userId?: string;
  roleId?: string; // For role-based signing
  email: string;
  name: string;
  rut?: string;
  role?: string;
  signerType: SignerType; // firmante o visador
  signatureType: SignatureType; // pin o cedula
  order: number;
  status: SignatureStatus;
  signedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  signature?: Signature;
}

// Document - created from template with filled variables
export interface Document {
  id: string;
  templateId?: string;
  title: string;
  description?: string;
  content: string;
  status: DocumentStatus;
  tags: Tag[];
  institutionId: string;
  createdBy: string;
  variables: DocumentVariable[];
  signers: DocumentSigner[];
  signatures: Signature[];
  fileSize?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  finalizedAt?: Date;
  documentHash?: string;
}

export interface DocumentVariable {
  key: string;
  type: 'text' | 'date' | 'number' | 'select';
  label: string;
  value?: string;
  options?: string[];
  required: boolean;
}

export interface Signature {
  id: string;
  documentId: string;
  signerId: string;
  signerEmail: string;
  signerName: string;
  method: SignatureMethod;
  signatureData?: string;
  signedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
}

export interface AuditEvent {
  id: string;
  documentId: string;
  type: 'created' | 'sent' | 'delivered' | 'opened' | 'signed' | 'rejected' | 'modified';
  timestamp: Date;
  actorId: string;
  actorEmail: string;
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    recipientEmail?: string;
    signatureHash?: string;
    signerName?: string;
    signatureMethod?: string;
    rejectionReason?: string;
  };
}

export interface KPIData {
  completionRate: number;
  avgSigningTime: number;
  documentsByStatus: Record<DocumentStatus, number>;
  signingTimeByDepartment: Record<string, number>;
  documentsOverTime: { date: string; count: number }[];
}

export interface FilterState {
  status: DocumentStatus[];
  tags: string[];
  dateRange: { from?: Date; to?: Date };
  institutionId?: string;
  search: string;
}

export interface ThemeConfig {
  primaryColor: string;
  logoUrl: string;
  institutionName: string;
}

// Report types
export interface ReportConfig {
  id: string;
  name: string;
  filters: ReportFilter[];
  columns: string[];
  institutionId: string;
  createdBy: string;
  createdAt: Date;
}

export interface ReportFilter {
  field: string;
  operator: 'equals' | 'contains' | 'gte' | 'lte' | 'between';
  value: string | string[] | { from: string; to: string };
}

export interface ReportJob {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  totalRecords?: number;
  processedRecords?: number;
  downloadUrl?: string;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}
