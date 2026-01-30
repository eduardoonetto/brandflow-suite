// Core entity types for the document signing platform

export type DocumentStatus = 'draft' | 'pending' | 'signed' | 'rejected';

export type SignatureMethod = 'draw' | 'certificate' | 'typed';

export interface Institution {
  id: string;
  name: string;
  taxId: string;
  apiKey: string;
  allowedDomain: string;
  primaryColor: string;
  logoUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  institutionId: string;
  departmentRoles: string[];
  avatarUrl?: string;
  createdAt: Date;
}

export type UserRole = 'superadmin' | 'admin' | 'user';

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

export interface Document {
  id: string;
  title: string;
  content: string;
  status: DocumentStatus;
  tags: Tag[];
  institutionId: string;
  createdBy: string;
  assignedTo?: string;
  assignedRole?: string;
  variables: DocumentVariable[];
  signatures: Signature[];
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
