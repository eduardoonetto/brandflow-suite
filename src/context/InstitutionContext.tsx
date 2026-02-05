import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Institution, InstitutionUser, InstitutionRole, User } from '@/types';

interface InstitutionContextValue {
  currentInstitution: Institution | null;
  userInstitutions: Institution[];
  institutionUsers: InstitutionUser[];
  setCurrentInstitution: (institution: Institution) => void;
  isPersonalInstitution: boolean;
  currentUserRole: InstitutionRole | null;
  getUsersForInstitution: (institutionId: string) => InstitutionUser[];
}

const InstitutionContext = createContext<InstitutionContextValue | undefined>(undefined);

// Mock institutions
const mockPersonalInstitution: Institution = {
  id: 'inst-personal',
  name: 'Mi Institución Personal',
  type: 'personal',
  primaryColor: '220 80% 45%',
  logoUrl: '',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockOrganizations: Institution[] = [
  {
    id: 'inst-acme',
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
    id: 'inst-tech',
    name: 'Tech Solutions SpA',
    type: 'organization',
    taxId: '76-5432109',
    primaryColor: '142 71% 45%',
    logoUrl: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Mock users for institutions
const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'admin@acme.com',
    name: 'John Smith',
    role: 'admin',
    institutionId: 'inst-personal',
    institutions: [
      { institutionId: 'inst-acme', role: 'Admin' },
      { institutionId: 'inst-tech', role: 'RRHH' },
    ],
    createdAt: new Date(),
  },
  {
    id: 'user-2',
    email: 'maria@acme.com',
    name: 'María García',
    role: 'user',
    institutionId: 'inst-personal-2',
    institutions: [
      { institutionId: 'inst-acme', role: 'RRHH' },
    ],
    createdAt: new Date(),
  },
  {
    id: 'user-3',
    email: 'carlos@acme.com',
    name: 'Carlos Rodríguez',
    role: 'user',
    institutionId: 'inst-personal-3',
    institutions: [
      { institutionId: 'inst-acme', role: 'Trabajador' },
      { institutionId: 'inst-tech', role: 'Finanzas' },
    ],
    createdAt: new Date(),
  },
  {
    id: 'user-4',
    email: 'ana@tech.com',
    name: 'Ana Martínez',
    role: 'admin',
    institutionId: 'inst-personal-4',
    institutions: [
      { institutionId: 'inst-tech', role: 'Admin' },
    ],
    createdAt: new Date(),
  },
  {
    id: 'user-5',
    email: 'pedro@acme.com',
    name: 'Pedro López',
    role: 'user',
    institutionId: 'inst-personal-5',
    institutions: [
      { institutionId: 'inst-acme', role: 'Finanzas' },
    ],
    createdAt: new Date(),
  },
];

// Mock institution users
const mockInstitutionUsers: InstitutionUser[] = [
  {
    id: 'iu-user-1-inst-acme',
    userId: 'user-1',
    institutionId: 'inst-acme',
    roles: ['Admin', 'RRHH'],
    user: mockUsers[0],
    joinedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'iu-user-1-inst-tech',
    userId: 'user-1',
    institutionId: 'inst-tech',
    roles: ['RRHH'],
    user: mockUsers[0],
    joinedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'iu-user-2-inst-acme',
    userId: 'user-2',
    institutionId: 'inst-acme',
    roles: ['RRHH', 'Legal'],
    user: mockUsers[1],
    joinedAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'iu-user-3-inst-acme',
    userId: 'user-3',
    institutionId: 'inst-acme',
    roles: ['Trabajador'],
    user: mockUsers[2],
    joinedAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'iu-user-3-inst-tech',
    userId: 'user-3',
    institutionId: 'inst-tech',
    roles: ['Finanzas', 'Gerencia'],
    user: mockUsers[2],
    joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'iu-user-4-inst-tech',
    userId: 'user-4',
    institutionId: 'inst-tech',
    roles: ['Admin'],
    user: mockUsers[3],
    joinedAt: new Date(Date.now() - 250 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'iu-user-5-inst-acme',
    userId: 'user-5',
    institutionId: 'inst-acme',
    roles: ['Finanzas', 'Trabajador'],
    user: mockUsers[4],
    joinedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
  },
];

export function InstitutionProvider({ children }: { children: React.ReactNode }) {
  const [currentInstitution, setCurrentInstitution] = useState<Institution>(mockPersonalInstitution);
  
  // User's institutions (personal + organizations they belong to)
  const userInstitutions = useMemo(() => {
    return [mockPersonalInstitution, ...mockOrganizations];
  }, []);

  const isPersonalInstitution = useMemo(() => {
    return currentInstitution?.type === 'personal';
  }, [currentInstitution]);

  const currentUserRole = useMemo(() => {
    if (isPersonalInstitution) return null;
    // Find current user's role in the selected institution
    const userRole = mockUsers[0].institutions.find(
      inst => inst.institutionId === currentInstitution?.id
    );
    return userRole?.role || null;
  }, [currentInstitution, isPersonalInstitution]);

  const getUsersForInstitution = useCallback((institutionId: string) => {
    return mockInstitutionUsers.filter(iu => iu.institutionId === institutionId);
  }, []);

  const institutionUsers = useMemo(() => {
    if (!currentInstitution) return [];
    return getUsersForInstitution(currentInstitution.id);
  }, [currentInstitution, getUsersForInstitution]);

  return (
    <InstitutionContext.Provider
      value={{
        currentInstitution,
        userInstitutions,
        institutionUsers,
        setCurrentInstitution,
        isPersonalInstitution,
        currentUserRole,
        getUsersForInstitution,
      }}
    >
      {children}
    </InstitutionContext.Provider>
  );
}

export function useInstitution() {
  const context = useContext(InstitutionContext);
  if (!context) {
    throw new Error('useInstitution must be used within an InstitutionProvider');
  }
  return context;
}
