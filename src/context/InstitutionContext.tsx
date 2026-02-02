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
const mockInstitutionUsers: InstitutionUser[] = mockUsers.flatMap(user =>
  user.institutions.map((inst, idx) => ({
    id: `iu-${user.id}-${inst.institutionId}`,
    userId: user.id,
    institutionId: inst.institutionId,
    role: inst.role,
    user,
    joinedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
  }))
);

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
