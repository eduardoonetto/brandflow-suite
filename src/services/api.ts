import { Institution, Document, User, Department, AuditEvent, KPIData } from '@/types';

// Simulated network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Base API interface
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Service interfaces
export interface IAuthService {
  login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>>;
  logout(): Promise<void>;
  refreshToken(): Promise<ApiResponse<{ token: string }>>;
  detectInstitution(domain: string): Promise<ApiResponse<Institution | null>>;
}

export interface IInstitutionService {
  getAll(): Promise<ApiResponse<Institution[]>>;
  getById(id: string): Promise<ApiResponse<Institution>>;
  create(data: Omit<Institution, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Institution>>;
  update(id: string, data: Partial<Institution>): Promise<ApiResponse<Institution>>;
  delete(id: string): Promise<ApiResponse<void>>;
}

export interface IDocumentService {
  getAll(institutionId: string): Promise<ApiResponse<Document[]>>;
  getById(id: string): Promise<ApiResponse<Document>>;
  create(data: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Document>>;
  update(id: string, data: Partial<Document>): Promise<ApiResponse<Document>>;
  delete(id: string): Promise<ApiResponse<void>>;
  sendForSignature(id: string, recipients: string[]): Promise<ApiResponse<void>>;
  getAuditTrail(id: string): Promise<ApiResponse<AuditEvent[]>>;
  exportZip(ids: string[]): Promise<Blob>;
}

export interface IKPIService {
  getDashboardData(institutionId: string): Promise<ApiResponse<KPIData>>;
}

// Mock implementations
export const mockAuthService: IAuthService = {
  async login(email, password) {
    await delay(800);
    return {
      success: true,
      data: {
        user: {
          id: 'user-1',
          email,
          name: 'John Smith',
          role: 'admin',
          institutionId: 'inst-personal',
          institutions: [
            { institutionId: 'inst-acme', role: 'Admin' },
            { institutionId: 'inst-tech', role: 'RRHH' },
          ],
          createdAt: new Date(),
        } as User,
        token: 'mock-jwt-token',
      },
    };
  },

  async logout() {
    await delay(300);
  },

  async refreshToken() {
    await delay(500);
    return { success: true, data: { token: 'new-mock-jwt-token' } };
  },

  async detectInstitution(domain) {
    await delay(600);
    if (domain.includes('acme')) {
      return {
        success: true,
        data: {
          id: 'inst-1',
          name: 'Acme Corporation',
          type: 'organization',
          taxId: '12-3456789',
          apiKey: 'ak_xxx',
          allowedDomain: 'acme.signflow.com',
          primaryColor: '220 80% 45%',
          logoUrl: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Institution,
      };
    }
    return { success: true, data: null };
  },
};

export const mockInstitutionService: IInstitutionService = {
  async getAll() {
    await delay(600);
    return {
      success: true,
      data: [
        {
          id: 'inst-1',
          name: 'Acme Corporation',
          type: 'organization',
          taxId: '12-3456789',
          apiKey: 'ak_live_xxxxx',
          allowedDomain: 'acme.signflow.com',
          primaryColor: '220 80% 45%',
          logoUrl: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'inst-2',
          name: 'TechStart Inc',
          type: 'organization',
          taxId: '98-7654321',
          apiKey: 'ak_live_yyyyy',
          allowedDomain: 'techstart.signflow.com',
          primaryColor: '175 65% 42%',
          logoUrl: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as Institution[],
    };
  },

  async getById(id) {
    await delay(400);
    return {
      success: true,
      data: {
        id,
        name: 'Acme Corporation',
        type: 'organization',
        taxId: '12-3456789',
        apiKey: 'ak_live_xxxxx',
        allowedDomain: 'acme.signflow.com',
        primaryColor: '220 80% 45%',
        logoUrl: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Institution,
    };
  },

  async create(data) {
    await delay(800);
    return {
      success: true,
      data: {
        ...data,
        id: `inst-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Institution,
    };
  },

  async update(id, data) {
    await delay(600);
    return {
      success: true,
      data: {
        id,
        name: data.name || 'Updated Institution',
        type: data.type || 'organization',
        taxId: data.taxId || '12-3456789',
        apiKey: data.apiKey || 'ak_xxx',
        allowedDomain: data.allowedDomain || 'updated.signflow.com',
        primaryColor: data.primaryColor || '220 80% 45%',
        logoUrl: data.logoUrl || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Institution,
    };
  },

  async delete(id) {
    await delay(500);
    return { success: true, data: undefined };
  },
};

export const mockKPIService: IKPIService = {
  async getDashboardData(institutionId) {
    await delay(700);
    return {
      success: true,
      data: {
        completionRate: 78.5,
        avgSigningTime: 2.3,
        documentsByStatus: {
          draft: 12,
          pending: 8,
          signed: 45,
          rejected: 3,
          trashed: 2,
        },
        signingTimeByDepartment: {
          RRHH: 1.8,
          Legal: 3.2,
          Finanzas: 2.1,
          Gerencia: 4.5,
        },
        documentsOverTime: [
          { date: '2024-01-01', count: 15 },
          { date: '2024-01-08', count: 22 },
          { date: '2024-01-15', count: 18 },
          { date: '2024-01-22', count: 31 },
          { date: '2024-01-29', count: 27 },
          { date: '2024-02-05', count: 35 },
        ],
      },
    };
  },
};

// Export services based on environment
export const authService = mockAuthService;
export const institutionService = mockInstitutionService;
export const kpiService = mockKPIService;
