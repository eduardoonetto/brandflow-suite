import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Document, Tag, FilterState, DocumentStatus } from '@/types';

interface DocumentContextValue {
  documents: Document[];
  selectedDocuments: string[];
  filters: FilterState;
  tags: Tag[];
  setFilters: (filters: Partial<FilterState>) => void;
  toggleDocumentSelection: (id: string) => void;
  selectAllDocuments: () => void;
  clearSelection: () => void;
  filteredDocuments: Document[];
  addDocument: (doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
}

const DocumentContext = createContext<DocumentContextValue | undefined>(undefined);

// Mock tags
const mockTags: Tag[] = [
  { id: 'tag-1', name: 'Contratos', color: '220 80% 45%', institutionId: 'inst-1' },
  { id: 'tag-2', name: 'RRHH', color: '142 71% 45%', institutionId: 'inst-1' },
  { id: 'tag-3', name: 'Legal', color: '38 92% 50%', institutionId: 'inst-1' },
  { id: 'tag-4', name: 'Finanzas', color: '280 70% 50%', institutionId: 'inst-1' },
  { id: 'tag-5', name: 'Clientes', color: '175 65% 42%', institutionId: 'inst-1' },
];

// Mock documents
const mockDocuments: Document[] = [
  {
    id: 'doc-1',
    title: 'Contrato de Trabajo - María García',
    content: 'Por medio del presente contrato, {{empresa_nombre}} con RUT {{empresa_rut}}, representada por {{representante_nombre}}, contrata a {{empleado_nombre}} con fecha de inicio {{fecha_inicio}} para el cargo de {{cargo}}...',
    status: 'pending',
    tags: [mockTags[0], mockTags[1]],
    institutionId: 'inst-1',
    createdBy: 'user-1',
    assignedRole: 'RRHH',
    variables: [
      { key: 'empresa_nombre', type: 'text', label: 'Nombre de Empresa', required: true },
      { key: 'empresa_rut', type: 'text', label: 'RUT Empresa', required: true },
      { key: 'representante_nombre', type: 'text', label: 'Representante Legal', required: true },
      { key: 'empleado_nombre', type: 'text', label: 'Nombre Empleado', required: true },
      { key: 'fecha_inicio', type: 'date', label: 'Fecha de Inicio', required: true },
      { key: 'cargo', type: 'text', label: 'Cargo', required: true },
    ],
    signatures: [],
    createdAt: new Date(Date.now() - 86400000 * 2),
    updatedAt: new Date(Date.now() - 86400000),
  },
  {
    id: 'doc-2',
    title: 'Acuerdo de Confidencialidad',
    content: 'Este Acuerdo de Confidencialidad se celebra entre {{parte_a}} y {{parte_b}} con fecha {{fecha_acuerdo}}...',
    status: 'draft',
    tags: [mockTags[2]],
    institutionId: 'inst-1',
    createdBy: 'user-1',
    variables: [
      { key: 'parte_a', type: 'text', label: 'Parte A', required: true },
      { key: 'parte_b', type: 'text', label: 'Parte B', required: true },
      { key: 'fecha_acuerdo', type: 'date', label: 'Fecha del Acuerdo', required: true },
    ],
    signatures: [],
    createdAt: new Date(Date.now() - 86400000 * 5),
    updatedAt: new Date(Date.now() - 86400000 * 3),
  },
  {
    id: 'doc-3',
    title: 'Orden de Compra #2024-001',
    content: 'Orden de compra para {{proveedor_nombre}} por un monto de ${{monto_total}} correspondiente a {{descripcion_items}}...',
    status: 'signed',
    tags: [mockTags[3]],
    institutionId: 'inst-1',
    createdBy: 'user-1',
    variables: [
      { key: 'proveedor_nombre', type: 'text', label: 'Proveedor', required: true, value: 'Tech Supplies Inc.' },
      { key: 'monto_total', type: 'number', label: 'Monto Total', required: true, value: '15000' },
      { key: 'descripcion_items', type: 'text', label: 'Descripción', required: true, value: 'Equipos de computación' },
    ],
    signatures: [
      {
        id: 'sig-1',
        documentId: 'doc-3',
        signerId: 'user-1',
        signerEmail: 'admin@acme.com',
        signerName: 'John Smith',
        method: 'draw',
        signedAt: new Date(Date.now() - 86400000),
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        location: 'Santiago, Chile',
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 7),
    updatedAt: new Date(Date.now() - 86400000),
    finalizedAt: new Date(Date.now() - 86400000),
    documentHash: 'sha256:abc123def456...',
  },
  {
    id: 'doc-4',
    title: 'Propuesta Comercial - Cliente XYZ',
    content: 'Propuesta comercial para {{cliente_nombre}} con fecha de validez hasta {{fecha_validez}}. Monto total: ${{monto_propuesta}}...',
    status: 'rejected',
    tags: [mockTags[4]],
    institutionId: 'inst-1',
    createdBy: 'user-1',
    assignedTo: 'client@xyz.com',
    variables: [
      { key: 'cliente_nombre', type: 'text', label: 'Cliente', required: true, value: 'XYZ Corporation' },
      { key: 'fecha_validez', type: 'date', label: 'Válido Hasta', required: true, value: '2024-03-31' },
      { key: 'monto_propuesta', type: 'number', label: 'Monto', required: true, value: '50000' },
    ],
    signatures: [],
    createdAt: new Date(Date.now() - 86400000 * 10),
    updatedAt: new Date(Date.now() - 86400000 * 2),
  },
  {
    id: 'doc-5',
    title: 'Addendum Contrato Servicios',
    content: 'Addendum al contrato de servicios entre {{empresa}} y {{cliente}} modificando las cláusulas {{clausulas_modificadas}}...',
    status: 'pending',
    tags: [mockTags[2], mockTags[4]],
    institutionId: 'inst-1',
    createdBy: 'user-1',
    assignedRole: 'Legal',
    variables: [
      { key: 'empresa', type: 'text', label: 'Empresa', required: true },
      { key: 'cliente', type: 'text', label: 'Cliente', required: true },
      { key: 'clausulas_modificadas', type: 'text', label: 'Cláusulas', required: true },
    ],
    signatures: [],
    createdAt: new Date(Date.now() - 86400000 * 1),
    updatedAt: new Date(),
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
      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(doc.status)) {
        return false;
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const docTagIds = doc.tags.map(t => t.id);
        if (!filters.tags.some(t => docTagIds.includes(t))) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateRange.from && doc.createdAt < filters.dateRange.from) {
        return false;
      }
      if (filters.dateRange.to && doc.createdAt > filters.dateRange.to) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          doc.title.toLowerCase().includes(searchLower) ||
          doc.content.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [documents, filters]);

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

  return (
    <DocumentContext.Provider
      value={{
        documents,
        selectedDocuments,
        filters,
        tags: mockTags,
        setFilters,
        toggleDocumentSelection,
        selectAllDocuments,
        clearSelection,
        filteredDocuments,
        addDocument,
        updateDocument,
        deleteDocument,
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
