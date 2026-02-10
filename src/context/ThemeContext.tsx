import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeConfig } from '@/types';

export interface SidebarTheme {
  name: string;
  sidebarBg: string;
  sidebarFg: string;
  sidebarAccent: string;
  sidebarBorder: string;
  sidebarMuted: string;
}

const sidebarThemes: SidebarTheme[] = [
  { name: 'Oscuro', sidebarBg: '222 47% 11%', sidebarFg: '220 14% 96%', sidebarAccent: '220 30% 18%', sidebarBorder: '220 20% 20%', sidebarMuted: '220 15% 35%' },
  { name: 'Azul Noche', sidebarBg: '220 60% 15%', sidebarFg: '210 40% 96%', sidebarAccent: '220 50% 22%', sidebarBorder: '220 40% 22%', sidebarMuted: '220 30% 40%' },
  { name: 'Verde Bosque', sidebarBg: '160 40% 12%', sidebarFg: '150 20% 95%', sidebarAccent: '160 35% 18%', sidebarBorder: '160 30% 18%', sidebarMuted: '160 20% 35%' },
  { name: 'Gris Claro', sidebarBg: '220 14% 96%', sidebarFg: '222 47% 11%', sidebarAccent: '220 13% 91%', sidebarBorder: '220 13% 88%', sidebarMuted: '220 9% 46%' },
  { name: 'Púrpura', sidebarBg: '270 40% 15%', sidebarFg: '270 20% 95%', sidebarAccent: '270 35% 22%', sidebarBorder: '270 30% 20%', sidebarMuted: '270 20% 40%' },
  { name: 'Terracota', sidebarBg: '15 35% 14%', sidebarFg: '20 20% 95%', sidebarAccent: '15 30% 20%', sidebarBorder: '15 25% 20%', sidebarMuted: '15 20% 40%' },
];

interface ThemeContextValue {
  theme: ThemeConfig;
  setTheme: (theme: Partial<ThemeConfig>) => void;
  resetTheme: () => void;
  sidebarThemes: SidebarTheme[];
  currentSidebarTheme: SidebarTheme;
  setSidebarTheme: (theme: SidebarTheme) => void;
}

const defaultTheme: ThemeConfig = {
  primaryColor: '220 80% 45%',
  logoUrl: '',
  institutionName: 'tuFirmaOK',
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeConfig>(defaultTheme);
  const [currentSidebarTheme, setCurrentSidebarTheme] = useState<SidebarTheme>(sidebarThemes[0]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', theme.primaryColor);
    
    const [h, s, l] = theme.primaryColor.split(' ').map(v => parseFloat(v));
    root.style.setProperty('--primary', theme.primaryColor);
    root.style.setProperty('--ring', theme.primaryColor);
    root.style.setProperty('--sidebar-primary', theme.primaryColor);
    root.style.setProperty('--primary-light', `${h} ${s}% ${Math.min(l + 10, 90)}%`);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--sidebar-background', currentSidebarTheme.sidebarBg);
    root.style.setProperty('--sidebar-foreground', currentSidebarTheme.sidebarFg);
    root.style.setProperty('--sidebar-accent', currentSidebarTheme.sidebarAccent);
    root.style.setProperty('--sidebar-border', currentSidebarTheme.sidebarBorder);
    root.style.setProperty('--sidebar-muted', currentSidebarTheme.sidebarMuted);
    root.style.setProperty('--sidebar-accent-foreground', currentSidebarTheme.sidebarFg);
  }, [currentSidebarTheme]);

  const setTheme = (newTheme: Partial<ThemeConfig>) => {
    setThemeState(prev => ({ ...prev, ...newTheme }));
  };

  const resetTheme = () => {
    setThemeState(defaultTheme);
    setCurrentSidebarTheme(sidebarThemes[0]);
  };

  const setSidebarTheme = (t: SidebarTheme) => {
    setCurrentSidebarTheme(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resetTheme, sidebarThemes, currentSidebarTheme, setSidebarTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
