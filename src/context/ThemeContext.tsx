import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeConfig } from '@/types';

export interface SidebarTheme {
  name: string;
  sidebarBg: string;
  sidebarFg: string;
  sidebarAccent: string;
  sidebarBorder: string;
  sidebarMuted: string;
  backgroundImage?: string;
  backgroundOpacity?: number;
  backgroundBlur?: number;
}

const sidebarThemes: SidebarTheme[] = [
  // Dark themes
  { name: 'Oscuro', sidebarBg: '222 47% 11%', sidebarFg: '220 14% 96%', sidebarAccent: '220 30% 18%', sidebarBorder: '220 20% 20%', sidebarMuted: '220 15% 35%' },
  { name: 'Azul Noche', sidebarBg: '220 60% 15%', sidebarFg: '210 40% 96%', sidebarAccent: '220 50% 22%', sidebarBorder: '220 40% 22%', sidebarMuted: '220 30% 40%' },
  { name: 'Verde Bosque', sidebarBg: '160 40% 12%', sidebarFg: '150 20% 95%', sidebarAccent: '160 35% 18%', sidebarBorder: '160 30% 18%', sidebarMuted: '160 20% 35%' },
  { name: 'Púrpura', sidebarBg: '270 40% 15%', sidebarFg: '270 20% 95%', sidebarAccent: '270 35% 22%', sidebarBorder: '270 30% 20%', sidebarMuted: '270 20% 40%' },
  { name: 'Terracota', sidebarBg: '15 35% 14%', sidebarFg: '20 20% 95%', sidebarAccent: '15 30% 20%', sidebarBorder: '15 25% 20%', sidebarMuted: '15 20% 40%' },
  // Light themes
  { name: 'Gris Claro', sidebarBg: '220 14% 96%', sidebarFg: '222 47% 11%', sidebarAccent: '220 13% 91%', sidebarBorder: '220 13% 88%', sidebarMuted: '220 9% 46%' },
  { name: 'Blanco Puro', sidebarBg: '0 0% 100%', sidebarFg: '222 47% 11%', sidebarAccent: '220 14% 96%', sidebarBorder: '220 13% 91%', sidebarMuted: '220 9% 46%' },
  { name: 'Arena', sidebarBg: '40 30% 95%', sidebarFg: '30 30% 15%', sidebarAccent: '38 25% 89%', sidebarBorder: '35 20% 85%', sidebarMuted: '30 15% 50%' },
  { name: 'Lavanda', sidebarBg: '250 30% 96%', sidebarFg: '250 30% 15%', sidebarAccent: '250 25% 91%', sidebarBorder: '250 20% 88%', sidebarMuted: '250 15% 50%' },
  { name: 'Menta', sidebarBg: '160 30% 95%', sidebarFg: '160 40% 12%', sidebarAccent: '158 25% 89%', sidebarBorder: '155 20% 85%', sidebarMuted: '160 15% 45%' },
  { name: 'Cielo', sidebarBg: '210 40% 96%', sidebarFg: '210 40% 12%', sidebarAccent: '210 35% 91%', sidebarBorder: '210 30% 88%', sidebarMuted: '210 20% 50%' },
  { name: 'Rosa Suave', sidebarBg: '340 30% 96%', sidebarFg: '340 30% 15%', sidebarAccent: '340 25% 91%', sidebarBorder: '340 20% 88%', sidebarMuted: '340 15% 50%' },
  // Background image themes
  { name: '🌸 Pétalos', sidebarBg: '340 40% 94%', sidebarFg: '340 50% 20%', sidebarAccent: '340 30% 88%', sidebarBorder: '340 25% 85%', sidebarMuted: '340 20% 50%', backgroundImage: '/assets/theme-bg-petals.png', backgroundOpacity: 0.15, backgroundBlur: 2 },
  { name: '🌊 Océano', sidebarBg: '200 60% 18%', sidebarFg: '200 20% 95%', sidebarAccent: '200 50% 25%', sidebarBorder: '200 40% 22%', sidebarMuted: '200 25% 45%', backgroundImage: '/assets/theme-bg-petals.png', backgroundOpacity: 0.08, backgroundBlur: 4 },
  { name: '🌅 Atardecer', sidebarBg: '25 50% 14%', sidebarFg: '30 30% 95%', sidebarAccent: '20 40% 20%', sidebarBorder: '20 35% 18%', sidebarMuted: '25 25% 45%', backgroundImage: '/assets/theme-bg-petals.png', backgroundOpacity: 0.1, backgroundBlur: 3 },
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
  primaryColor: '280 70% 50%',
  logoUrl: '',
  institutionName: '',
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeConfig>(defaultTheme);
  const [currentSidebarTheme, setCurrentSidebarTheme] = useState<SidebarTheme>(sidebarThemes[3]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', theme.primaryColor);
    
    const parts = theme.primaryColor.split(' ');
    const h = parseFloat(parts[0]);
    const s = parseFloat(parts[1]);
    const l = parseFloat(parts[2]);
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
    
    // Background image CSS vars
    if (currentSidebarTheme.backgroundImage) {
      root.style.setProperty('--sidebar-bg-image', `url(${currentSidebarTheme.backgroundImage})`);
      root.style.setProperty('--sidebar-bg-opacity', String(currentSidebarTheme.backgroundOpacity || 0.1));
      root.style.setProperty('--sidebar-bg-blur', `${currentSidebarTheme.backgroundBlur || 0}px`);
    } else {
      root.style.removeProperty('--sidebar-bg-image');
      root.style.removeProperty('--sidebar-bg-opacity');
      root.style.removeProperty('--sidebar-bg-blur');
    }
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
