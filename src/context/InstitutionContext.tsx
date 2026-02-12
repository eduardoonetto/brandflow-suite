import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { Institution, InstitutionUser, InstitutionRole, User } from '@/types';
import { useTheme } from '@/context/ThemeContext';

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

// Mock institutions with logos and sidebar themes
const mockPersonalInstitution: Institution = {
  id: 'inst-personal',
  name: 'Mi Institución Personal',
  type: 'personal',
  primaryColor: '280 70% 50%',
  logoUrl: '',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockOrganizations: Institution[] = [
  {
    id: 'inst-acme',
    name: 'Codelco',
    type: 'organization',
    taxId: '12-3456789',
    apiKey: 'ak_live_xxxxx',
    allowedDomain: 'codelco.cl',
    primaryColor: '22 90% 48%', // Orange for Codelco
    logoUrl: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'inst-tech',
    name: 'Banco Falabella',
    type: 'organization',
    taxId: '76-5432109',
    primaryColor: '152 55% 28%', // Dark green for Falabella
    logoUrl: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Default sidebar themes per institution
const institutionSidebarThemes: Record<string, { sidebarBg: string; sidebarFg: string; sidebarAccent: string; sidebarBorder: string; sidebarMuted: string }> = {
  'inst-personal': { sidebarBg: '270 40% 15%', sidebarFg: '270 20% 95%', sidebarAccent: '270 35% 22%', sidebarBorder: '270 30% 20%', sidebarMuted: '270 20% 40%' },
  'inst-acme': { sidebarBg: '20 35% 14%', sidebarFg: '20 20% 95%', sidebarAccent: '22 40% 20%', sidebarBorder: '20 30% 18%', sidebarMuted: '20 20% 45%' },
  'inst-tech': { sidebarBg: '152 40% 12%', sidebarFg: '150 20% 95%', sidebarAccent: '152 35% 18%', sidebarBorder: '152 30% 16%', sidebarMuted: '150 20% 40%' },
};

// Mock users
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
    institutions: [{ institutionId: 'inst-acme', role: 'RRHH' }],
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
    institutions: [{ institutionId: 'inst-tech', role: 'Admin' }],
    createdAt: new Date(),
  },
  {
    id: 'user-5',
    email: 'pedro@acme.com',
    name: 'Pedro López',
    role: 'user',
    institutionId: 'inst-personal-5',
    institutions: [{ institutionId: 'inst-acme', role: 'Finanzas' }],
    createdAt: new Date(),
  },
];

const mockInstitutionUsers: InstitutionUser[] = [
  { id: 'iu-user-1-inst-acme', userId: 'user-1', institutionId: 'inst-acme', roles: ['Admin', 'RRHH'], user: mockUsers[0], joinedAt: new Date(Date.now() - 365 * 86400000) },
  { id: 'iu-user-1-inst-tech', userId: 'user-1', institutionId: 'inst-tech', roles: ['RRHH'], user: mockUsers[0], joinedAt: new Date(Date.now() - 180 * 86400000) },
  { id: 'iu-user-2-inst-acme', userId: 'user-2', institutionId: 'inst-acme', roles: ['RRHH', 'Legal'], user: mockUsers[1], joinedAt: new Date(Date.now() - 200 * 86400000) },
  { id: 'iu-user-3-inst-acme', userId: 'user-3', institutionId: 'inst-acme', roles: ['Trabajador'], user: mockUsers[2], joinedAt: new Date(Date.now() - 150 * 86400000) },
  { id: 'iu-user-3-inst-tech', userId: 'user-3', institutionId: 'inst-tech', roles: ['Finanzas', 'Gerencia'], user: mockUsers[2], joinedAt: new Date(Date.now() - 90 * 86400000) },
  { id: 'iu-user-4-inst-tech', userId: 'user-4', institutionId: 'inst-tech', roles: ['Admin'], user: mockUsers[3], joinedAt: new Date(Date.now() - 250 * 86400000) },
  { id: 'iu-user-5-inst-acme', userId: 'user-5', institutionId: 'inst-acme', roles: ['Finanzas', 'Trabajador'], user: mockUsers[4], joinedAt: new Date(Date.now() - 120 * 86400000) },
];

export function InstitutionProvider({ children }: { children: React.ReactNode }) {
  const [currentInstitution, setCurrentInstitutionState] = useState<Institution>(mockPersonalInstitution);
  const { setTheme } = useTheme();

  const userInstitutions = useMemo(() => {
    return [mockPersonalInstitution, ...mockOrganizations];
  }, []);

  const isPersonalInstitution = useMemo(() => {
    return currentInstitution?.type === 'personal';
  }, [currentInstitution]);

  const setCurrentInstitution = useCallback((institution: Institution) => {
    setCurrentInstitutionState(institution);
    
    // Apply institution theme
    setTheme({ primaryColor: institution.primaryColor });
    
    // Apply institution sidebar theme
    const sidebarTheme = institutionSidebarThemes[institution.id];
    if (sidebarTheme) {
      const root = document.documentElement;
      root.style.setProperty('--sidebar-background', sidebarTheme.sidebarBg);
      root.style.setProperty('--sidebar-foreground', sidebarTheme.sidebarFg);
      root.style.setProperty('--sidebar-accent', sidebarTheme.sidebarAccent);
      root.style.setProperty('--sidebar-border', sidebarTheme.sidebarBorder);
      root.style.setProperty('--sidebar-muted', sidebarTheme.sidebarMuted);
      root.style.setProperty('--sidebar-accent-foreground', sidebarTheme.sidebarFg);
    }
  }, [setTheme]);

  // Apply initial institution theme
  useEffect(() => {
    setCurrentInstitution(currentInstitution);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const currentUserRole = useMemo(() => {
    if (isPersonalInstitution) return null;
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
