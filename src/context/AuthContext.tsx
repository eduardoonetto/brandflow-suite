import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, Institution, UserInstitutionRole } from '@/types';

interface AuthContextValue {
  user: User | null;
  institution: Institution | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setInstitution: (institution: Institution) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Mock data for development
const mockInstitution: Institution = {
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
};

const mockUserInstitutions: UserInstitutionRole[] = [
  { institutionId: 'inst-acme', role: 'Admin' },
  { institutionId: 'inst-tech', role: 'RRHH' },
];

const mockUser: User = {
  id: 'user-1',
  email: 'admin@acme.com',
  name: 'John Smith',
  role: 'admin',
  institutionId: 'inst-personal',
  institutions: mockUserInstitutions,
  createdAt: new Date(),
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock login - in production this would validate against backend
    if (email && password) {
      setUser({ ...mockUser, email });
      setInstitution(mockInstitution);
    }
    
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setInstitution(null);
  }, []);

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        institution, 
        isAuthenticated: !!user, 
        isLoading,
        login, 
        logout,
        setInstitution 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
