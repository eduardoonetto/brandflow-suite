import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Document, DocumentTemplate, Tag, FilterState, DocumentStatus, DocumentSigner } from '@/types';

interface DocumentContextValue {
  documents: Document[];
  templates: DocumentTemplate[];
  selectedDocuments: string[];
  filters: FilterState;
  tags: Tag[];
  setFilters: (filters: Partial<FilterState>) => void;
  toggleDocumentSelection: (id: string) => void;
  selectAllDocuments: () => void;
  clearSelection: () => void;
  filteredDocuments: Document[];
  // Documents by status for current user
  pendingDocuments: Document[]; // Need my signature
  inProgressDocuments: Document[]; // I signed, waiting for others
  signedDocuments: Document[]; // All signed
  rejectedDocuments: Document[]; // Someone rejected
  // Template operations
  addTemplate: (template: Omit<DocumentTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTemplate: (id: string, updates: Partial<DocumentTemplate>) => void;
  deleteTemplate: (id: string) => void;
  // Document operations
  addDocument: (doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  createDocumentFromTemplate: (templateId: string, variables: Record<string, string>, signers: Omit<DocumentSigner, 'id' | 'documentId'>[]) => Document;
}

const DocumentContext = createContext<DocumentContextValue | undefined>(undefined);

// Mock current user ID
const CURRENT_USER_ID = 'user-1';
const CURRENT_USER_EMAIL = 'admin@acme.com';

// Mock tags
const mockTags: Tag[] = [
  { id: 'tag-1', name: 'Contratos', color: '220 80% 45%', institutionId: 'inst-acme' },
  { id: 'tag-2', name: 'RRHH', color: '142 71% 45%', institutionId: 'inst-acme' },
  { id: 'tag-3', name: 'Legal', color: '38 92% 50%', institutionId: 'inst-acme' },
  { id: 'tag-4', name: 'Finanzas', color: '280 70% 50%', institutionId: 'inst-acme' },
  { id: 'tag-5', name: 'NDA', color: '175 65% 42%', institutionId: 'inst-acme' },
  { id: 'tag-6', name: 'Orden de Compra', color: '340 75% 55%', institutionId: 'inst-acme' },
];

// Mock templates
const mockTemplates: DocumentTemplate[] = [
  {
    id: 'tmpl-1',
    title: 'Contrato de Trabajo',
    description: 'Plantilla estándar para contratos de trabajo indefinido',
    templateType: 'template',
    content: 'Por medio del presente contrato, {{empresa_nombre}} con RUT {{empresa_rut}}, representada por {{representante_nombre}}, contrata a {{empleado_nombre}} con fecha de inicio {{fecha_inicio}} para el cargo de {{cargo}}...',
    category: 'Contratos',
    tags: [mockTags[0], mockTags[1]],
    institutionId: 'inst-acme',
    createdBy: 'user-1',
    variables: [
      { key: 'empresa_nombre', type: 'text', label: 'Nombre de Empresa', required: true },
      { key: 'empresa_rut', type: 'text', label: 'RUT Empresa', required: true },
      { key: 'representante_nombre', type: 'text', label: 'Representante Legal', required: true },
      { key: 'empleado_nombre', type: 'text', label: 'Nombre Empleado', required: true },
      { key: 'fecha_inicio', type: 'date', label: 'Fecha de Inicio', required: true },
      { key: 'cargo', type: 'text', label: 'Cargo', required: true },
    ],
    isActive: true,
    createdAt: new Date(Date.now() - 86400000 * 30),
    updatedAt: new Date(Date.now() - 86400000 * 5),
  },
  {
    id: 'tmpl-2',
    title: 'Acuerdo de Confidencialidad (NDA)',
    description: 'Acuerdo de confidencialidad bilateral para proyectos empresariales',
    templateType: 'template',
    content: 'Este Acuerdo de Confidencialidad se celebra entre {{parte_a}} y {{parte_b}} con fecha {{fecha_acuerdo}}...',
    category: 'Legal',
    tags: [mockTags[2], mockTags[4]],
    institutionId: 'inst-acme',
    createdBy: 'user-1',
    variables: [
      { key: 'parte_a', type: 'text', label: 'Parte A', required: true },
      { key: 'parte_b', type: 'text', label: 'Parte B', required: true },
      { key: 'fecha_acuerdo', type: 'date', label: 'Fecha del Acuerdo', required: true },
    ],
    isActive: true,
    createdAt: new Date(Date.now() - 86400000 * 60),
    updatedAt: new Date(Date.now() - 86400000 * 10),
  },
  {
    id: 'tmpl-3',
    title: 'Orden de Compra',
    description: 'Formato estándar para órdenes de compra a proveedores',
    templateType: 'template',
    content: 'Orden de compra para {{proveedor_nombre}} por un monto de ${{monto_total}} correspondiente a {{descripcion_items}}...',
    category: 'Finanzas',
    tags: [mockTags[3], mockTags[5]],
    institutionId: 'inst-acme',
    createdBy: 'user-1',
    variables: [
      { key: 'proveedor_nombre', type: 'text', label: 'Proveedor', required: true },
      { key: 'monto_total', type: 'number', label: 'Monto Total', required: true },
      { key: 'descripcion_items', type: 'text', label: 'Descripción', required: true },
    ],
    isActive: true,
    createdAt: new Date(Date.now() - 86400000 * 45),
    updatedAt: new Date(Date.now() - 86400000 * 2),
  },
];

// Mock documents with signers
const mockDocuments: Document[] = [
  {
    id: 'doc-1',
    templateId: 'tmpl-1',
    title: 'Contrato de Arrendamiento 2025',
    description: 'Contrato de arrendamiento para el inmueble ubicado en Av. Principal 123',
    content: 'Por medio del presente contrato, Acme Corporation con RUT 12-3456789...',
    status: 'pending',
    tags: [mockTags[0]],
    institutionId: 'inst-acme',
    createdBy: 'user-2',
    variables: [
      { key: 'empresa_nombre', type: 'text', label: 'Nombre de Empresa', required: true, value: 'Acme Corporation' },
    ],
    signers: [
      { id: 'signer-1', documentId: 'doc-1', userId: 'user-1', email: 'admin@acme.com', name: 'John Smith', rut: '12.345.678-9', order: 1, status: 'pending', signerType: 'signer', signatureType: 'pin' },
      { id: 'signer-2', documentId: 'doc-1', userId: 'user-2', email: 'maria@acme.com', name: 'María García', rut: '11.222.333-4', order: 2, status: 'pending', signerType: 'signer', signatureType: 'pin' },
    ],
    signatures: [],
    fileSize: '2.4 MB',
    expiresAt: new Date('2025-10-25'),
    createdAt: new Date('2025-10-15'),
    updatedAt: new Date('2025-10-15'),
  },
  {
    id: 'doc-2',
    templateId: 'tmpl-2',
    title: 'Acuerdo de Confidencialidad',
    description: 'NDA para proyecto de desarrollo de software empresarial',
    content: 'Este Acuerdo de Confidencialidad se celebra entre Acme Corp y Tech Solutions...',
    status: 'pending',
    tags: [mockTags[4]],
    institutionId: 'inst-acme',
    createdBy: 'user-4',
    variables: [
      { key: 'parte_a', type: 'text', label: 'Parte A', required: true, value: 'Acme Corp' },
      { key: 'parte_b', type: 'text', label: 'Parte B', required: true, value: 'Tech Solutions' },
    ],
    signers: [
      { id: 'signer-3', documentId: 'doc-2', userId: 'user-3', email: 'carlos@acme.com', name: 'Carlos Rodríguez', rut: '14.555.666-7', order: 1, status: 'pending', signerType: 'signer', signatureType: 'cedula' },
    ],
    signatures: [],
    fileSize: '1.1 MB',
    expiresAt: new Date('2025-10-30'),
    createdAt: new Date('2025-10-18'),
    updatedAt: new Date('2025-10-18'),
  },
  {
    id: 'doc-3',
    templateId: 'tmpl-3',
    title: 'Orden de Compra #2025-089',
    description: 'Orden de compra para equipos de oficina y tecnología',
    content: 'Orden de compra para Tech Supplies Inc. por un monto de $15,000...',
    status: 'pending',
    tags: [mockTags[5]],
    institutionId: 'inst-acme',
    createdBy: 'user-5',
    variables: [
      { key: 'proveedor_nombre', type: 'text', label: 'Proveedor', required: true, value: 'Tech Supplies Inc.' },
      { key: 'monto_total', type: 'number', label: 'Monto Total', required: true, value: '15000' },
    ],
    signers: [
      { id: 'signer-4', documentId: 'doc-3', userId: 'user-1', email: 'admin@acme.com', name: 'John Smith', rut: '12.345.678-9', order: 1, status: 'pending', signerType: 'approver', signatureType: 'pin' },
      { id: 'signer-5', documentId: 'doc-3', userId: 'user-5', email: 'pedro@acme.com', name: 'Pedro López', rut: '17.888.999-0', order: 2, status: 'pending', signerType: 'signer', signatureType: 'pin' },
    ],
    signatures: [],
    fileSize: '1.5 MB',
    expiresAt: new Date('2025-10-24'),
    createdAt: new Date('2025-10-21'),
    updatedAt: new Date('2025-10-21'),
  },
  {
    id: 'doc-4',
    title: 'Contrato de Servicios ABC',
    description: 'Contrato de servicios profesionales',
    content: 'Contrato de servicios entre las partes...',
    status: 'pending',
    tags: [mockTags[0]],
    institutionId: 'inst-acme',
    createdBy: 'user-2',
    variables: [],
    signers: [
      { id: 'signer-6', documentId: 'doc-4', userId: 'user-1', email: 'admin@acme.com', name: 'John Smith', rut: '12.345.678-9', order: 1, status: 'signed', signedAt: new Date(), signerType: 'signer', signatureType: 'pin' },
      { id: 'signer-7', documentId: 'doc-4', userId: 'user-2', email: 'maria@acme.com', name: 'María García', rut: '11.222.333-4', order: 2, status: 'pending', signerType: 'signer', signatureType: 'cedula' },
    ],
    signatures: [
      {
        id: 'sig-1',
        documentId: 'doc-4',
        signerId: 'user-1',
        signerEmail: 'admin@acme.com',
        signerName: 'John Smith',
        method: 'draw',
        signedAt: new Date(Date.now() - 86400000),
      },
    ],
    fileSize: '890 KB',
    createdAt: new Date(Date.now() - 86400000 * 3),
    updatedAt: new Date(Date.now() - 86400000),
  },
  {
    id: 'doc-5',
    title: 'Acuerdo de Colaboración XYZ',
    description: 'Acuerdo de colaboración empresarial',
    content: 'Las partes acuerdan colaborar en...',
    status: 'pending',
    tags: [mockTags[2]],
    institutionId: 'inst-acme',
    createdBy: 'user-3',
    variables: [],
    signers: [
      { id: 'signer-8', documentId: 'doc-5', userId: 'user-1', email: 'admin@acme.com', name: 'John Smith', rut: '12.345.678-9', order: 1, status: 'signed', signedAt: new Date(), signerType: 'signer', signatureType: 'pin' },
      { id: 'signer-9', documentId: 'doc-5', userId: 'user-3', email: 'carlos@acme.com', name: 'Carlos Rodríguez', rut: '14.555.666-7', order: 2, status: 'pending', signerType: 'signer', signatureType: 'pin' },
    ],
    signatures: [
      {
        id: 'sig-2',
        documentId: 'doc-5',
        signerId: 'user-1',
        signerEmail: 'admin@acme.com',
        signerName: 'John Smith',
        method: 'typed',
        signedAt: new Date(Date.now() - 86400000 * 2),
      },
    ],
    fileSize: '1.2 MB',
    createdAt: new Date(Date.now() - 86400000 * 5),
    updatedAt: new Date(Date.now() - 86400000 * 2),
  },
  {
    id: 'doc-6',
    title: 'Contrato de Compraventa',
    description: 'Contrato de compraventa de equipos',
    content: 'Se acuerda la compraventa de...',
    status: 'signed',
    tags: [mockTags[0], mockTags[3]],
    institutionId: 'inst-acme',
    createdBy: 'user-1',
    variables: [],
    signers: [
      { id: 'signer-10', documentId: 'doc-6', userId: 'user-1', email: 'admin@acme.com', name: 'John Smith', rut: '12.345.678-9', order: 1, status: 'signed', signedAt: new Date(Date.now() - 86400000 * 3), signerType: 'signer', signatureType: 'pin' },
      { id: 'signer-11', documentId: 'doc-6', userId: 'user-5', email: 'pedro@acme.com', name: 'Pedro López', rut: '17.888.999-0', order: 2, status: 'signed', signedAt: new Date(Date.now() - 86400000 * 2), signerType: 'signer', signatureType: 'cedula' },
    ],
    signatures: [
      {
        id: 'sig-3',
        documentId: 'doc-6',
        signerId: 'user-1',
        signerEmail: 'admin@acme.com',
        signerName: 'John Smith',
        method: 'draw',
        signedAt: new Date(Date.now() - 86400000 * 3),
      },
      {
        id: 'sig-4',
        documentId: 'doc-6',
        signerId: 'user-5',
        signerEmail: 'pedro@acme.com',
        signerName: 'Pedro López',
        method: 'certificate',
        signedAt: new Date(Date.now() - 86400000 * 2),
      },
    ],
    fileSize: '2.1 MB',
    createdAt: new Date(Date.now() - 86400000 * 10),
    updatedAt: new Date(Date.now() - 86400000 * 2),
    finalizedAt: new Date(Date.now() - 86400000 * 2),
    documentHash: 'sha256:def789abc123...',
  },
  {
    id: 'doc-7',
    title: 'Propuesta Comercial Rechazada',
    description: 'Propuesta que fue rechazada por el cliente',
    content: 'Propuesta comercial para cliente...',
    status: 'rejected',
    tags: [mockTags[3]],
    institutionId: 'inst-acme',
    createdBy: 'user-1',
    variables: [],
    signers: [
      { id: 'signer-12', documentId: 'doc-7', userId: 'user-1', email: 'admin@acme.com', name: 'John Smith', rut: '12.345.678-9', order: 1, status: 'signed', signedAt: new Date(Date.now() - 86400000 * 5), signerType: 'signer', signatureType: 'pin' },
      { id: 'signer-13', documentId: 'doc-7', userId: 'user-3', email: 'carlos@acme.com', name: 'Carlos Rodríguez', rut: '14.555.666-7', order: 2, status: 'rejected', rejectedAt: new Date(Date.now() - 86400000 * 4), rejectionReason: 'Términos no aceptables', signerType: 'signer', signatureType: 'cedula' },
    ],
    signatures: [
      {
        id: 'sig-5',
        documentId: 'doc-7',
        signerId: 'user-1',
        signerEmail: 'admin@acme.com',
        signerName: 'John Smith',
        method: 'typed',
        signedAt: new Date(Date.now() - 86400000 * 5),
      },
    ],
    fileSize: '950 KB',
    createdAt: new Date(Date.now() - 86400000 * 7),
    updatedAt: new Date(Date.now() - 86400000 * 4),
  },
  {
    id: 'doc-8',
    title: 'NDA Proyecto Alpha',
    description: 'Acuerdo de confidencialidad firmado',
    content: 'Las partes acuerdan mantener confidencialidad...',
    status: 'signed',
    tags: [mockTags[4]],
    institutionId: 'inst-acme',
    createdBy: 'user-2',
    variables: [],
    signers: [
      { id: 'signer-14', documentId: 'doc-8', userId: 'user-2', email: 'maria@acme.com', name: 'María García', rut: '11.222.333-4', order: 1, status: 'signed', signedAt: new Date(Date.now() - 86400000 * 6), signerType: 'approver', signatureType: 'pin' },
      { id: 'signer-15', documentId: 'doc-8', userId: 'user-1', email: 'admin@acme.com', name: 'John Smith', rut: '12.345.678-9', order: 2, status: 'signed', signedAt: new Date(Date.now() - 86400000 * 5), signerType: 'signer', signatureType: 'pin' },
    ],
    signatures: [
      {
        id: 'sig-6',
        documentId: 'doc-8',
        signerId: 'user-2',
        signerEmail: 'maria@acme.com',
        signerName: 'María García',
        method: 'draw',
        signedAt: new Date(Date.now() - 86400000 * 6),
      },
      {
        id: 'sig-7',
        documentId: 'doc-8',
        signerId: 'user-1',
        signerEmail: 'admin@acme.com',
        signerName: 'John Smith',
        method: 'draw',
        signedAt: new Date(Date.now() - 86400000 * 5),
      },
    ],
    fileSize: '780 KB',
    createdAt: new Date(Date.now() - 86400000 * 8),
    updatedAt: new Date(Date.now() - 86400000 * 5),
    finalizedAt: new Date(Date.now() - 86400000 * 5),
    documentHash: 'sha256:ghi456jkl789...',
  },
  {
    id: 'doc-9',
    title: 'Orden de Compra #2025-088',
    description: 'Orden de compra para suministros',
    content: 'Orden de compra...',
    status: 'signed',
    tags: [mockTags[5]],
    institutionId: 'inst-acme',
    createdBy: 'user-5',
    variables: [],
    signers: [
      { id: 'signer-16', documentId: 'doc-9', userId: 'user-5', email: 'pedro@acme.com', name: 'Pedro López', rut: '17.888.999-0', order: 1, status: 'signed', signedAt: new Date(Date.now() - 86400000 * 4), signerType: 'signer', signatureType: 'cedula' },
      { id: 'signer-17', documentId: 'doc-9', userId: 'user-1', email: 'admin@acme.com', name: 'John Smith', rut: '12.345.678-9', order: 2, status: 'signed', signedAt: new Date(Date.now() - 86400000 * 3), signerType: 'approver', signatureType: 'pin' },
    ],
    signatures: [
      {
        id: 'sig-8',
        documentId: 'doc-9',
        signerId: 'user-5',
        signerEmail: 'pedro@acme.com',
        signerName: 'Pedro López',
        method: 'certificate',
        signedAt: new Date(Date.now() - 86400000 * 4),
      },
      {
        id: 'sig-9',
        documentId: 'doc-9',
        signerId: 'user-1',
        signerEmail: 'admin@acme.com',
        signerName: 'John Smith',
        method: 'draw',
        signedAt: new Date(Date.now() - 86400000 * 3),
      },
    ],
    fileSize: '1.3 MB',
    createdAt: new Date(Date.now() - 86400000 * 6),
    updatedAt: new Date(Date.now() - 86400000 * 3),
    finalizedAt: new Date(Date.now() - 86400000 * 3),
    documentHash: 'sha256:mno012pqr345...',
  },
];

const defaultFilters: FilterState = {
  status: [],
  tags: [],
  dateRange: {},
  search: '',
};

export function DocumentProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [templates, setTemplates] = useState<DocumentTemplate[]>(mockTemplates);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [filters, setFiltersState] = useState<FilterState>(defaultFilters);

  const setFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const toggleDocumentSelection = useCallback((id: string) => {
    setSelectedDocuments(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  }, []);

  const selectAllDocuments = useCallback(() => {
    setSelectedDocuments(documents.map(d => d.id));
  }, [documents]);

  const clearSelection = useCallback(() => {
    setSelectedDocuments([]);
  }, []);

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      if (filters.status.length > 0 && !filters.status.includes(doc.status)) {
        return false;
      }
      if (filters.tags.length > 0) {
        const docTagIds = doc.tags.map(t => t.id);
        if (!filters.tags.some(t => docTagIds.includes(t))) {
          return false;
        }
      }
      if (filters.dateRange.from && doc.createdAt < filters.dateRange.from) {
        return false;
      }
      if (filters.dateRange.to && doc.createdAt > filters.dateRange.to) {
        return false;
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          doc.title.toLowerCase().includes(searchLower) ||
          doc.content.toLowerCase().includes(searchLower) ||
          doc.description?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [documents, filters]);

  // Documents pending MY signature
  const pendingDocuments = useMemo(() => {
    return documents.filter(doc => {
      const mySigner = doc.signers.find(s => s.userId === CURRENT_USER_ID || s.email === CURRENT_USER_EMAIL);
      return mySigner?.status === 'pending';
    });
  }, [documents]);

  // Documents where I already signed but others haven't
  const inProgressDocuments = useMemo(() => {
    return documents.filter(doc => {
      const mySigner = doc.signers.find(s => s.userId === CURRENT_USER_ID || s.email === CURRENT_USER_EMAIL);
      const iSigned = mySigner?.status === 'signed';
      const othersStillPending = doc.signers.some(s => 
        (s.userId !== CURRENT_USER_ID && s.email !== CURRENT_USER_EMAIL) && s.status === 'pending'
      );
      return iSigned && othersStillPending && doc.status !== 'rejected';
    });
  }, [documents]);

  // All signers signed
  const signedDocuments = useMemo(() => {
    return documents.filter(doc => doc.status === 'signed');
  }, [documents]);

  // Someone rejected
  const rejectedDocuments = useMemo(() => {
    return documents.filter(doc => doc.status === 'rejected');
  }, [documents]);

  // Template operations
  const addTemplate = useCallback((template: Omit<DocumentTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTemplate: DocumentTemplate = {
      ...template,
      id: `tmpl-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTemplates(prev => [newTemplate, ...prev]);
  }, []);

  const updateTemplate = useCallback((id: string, updates: Partial<DocumentTemplate>) => {
    setTemplates(prev =>
      prev.map(tmpl =>
        tmpl.id === id ? { ...tmpl, ...updates, updatedAt: new Date() } : tmpl
      )
    );
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    setTemplates(prev => prev.filter(tmpl => tmpl.id !== id));
  }, []);

  // Document operations
  const addDocument = useCallback((doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newDoc: Document = {
      ...doc,
      id: `doc-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setDocuments(prev => [newDoc, ...prev]);
  }, []);

  const updateDocument = useCallback((id: string, updates: Partial<Document>) => {
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === id ? { ...doc, ...updates, updatedAt: new Date() } : doc
      )
    );
  }, []);

  const deleteDocument = useCallback((id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    setSelectedDocuments(prev => prev.filter(d => d !== id));
  }, []);

  const createDocumentFromTemplate = useCallback((
    templateId: string,
    variables: Record<string, string>,
    signers: Omit<DocumentSigner, 'id' | 'documentId'>[]
  ): Document => {
    const template = templates.find(t => t.id === templateId);
    if (!template) throw new Error('Template not found');

    let content = template.content;
    Object.entries(variables).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    const docId = `doc-${Date.now()}`;
    const newDoc: Document = {
      id: docId,
      templateId,
      title: template.title,
      description: template.description,
      content,
      status: 'pending',
      tags: template.tags,
      institutionId: template.institutionId,
      createdBy: CURRENT_USER_ID,
      variables: template.variables.map(v => ({
        ...v,
        value: variables[v.key] || '',
      })),
      signers: signers.map((s, idx) => ({
        ...s,
        id: `signer-${Date.now()}-${idx}`,
        documentId: docId,
      })),
      signatures: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setDocuments(prev => [newDoc, ...prev]);
    return newDoc;
  }, [templates]);

  return (
    <DocumentContext.Provider
      value={{
        documents,
        templates,
        selectedDocuments,
        filters,
        tags: mockTags,
        setFilters,
        toggleDocumentSelection,
        selectAllDocuments,
        clearSelection,
        filteredDocuments,
        pendingDocuments,
        inProgressDocuments,
        signedDocuments,
        rejectedDocuments,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        addDocument,
        updateDocument,
        deleteDocument,
        createDocumentFromTemplate,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocuments() {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
}
