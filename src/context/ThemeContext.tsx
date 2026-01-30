import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeConfig } from '@/types';

interface ThemeContextValue {
  theme: ThemeConfig;
  setTheme: (theme: Partial<ThemeConfig>) => void;
  resetTheme: () => void;
}

const defaultTheme: ThemeConfig = {
  primaryColor: '220 80% 45%',
  logoUrl: '',
  institutionName: 'SignFlow',
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeConfig>(defaultTheme);

  useEffect(() => {
    // Apply theme to CSS variables
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', theme.primaryColor);
    
    // Parse HSL and create variations
    const [h, s, l] = theme.primaryColor.split(' ').map(v => parseFloat(v));
    root.style.setProperty('--primary', theme.primaryColor);
    root.style.setProperty('--ring', theme.primaryColor);
    root.style.setProperty('--sidebar-primary', theme.primaryColor);
    
    // Lighter variation for hover states
    root.style.setProperty('--primary-light', `${h} ${s}% ${Math.min(l + 10, 90)}%`);
    
  }, [theme]);

  const setTheme = (newTheme: Partial<ThemeConfig>) => {
    setThemeState(prev => ({ ...prev, ...newTheme }));
  };

  const resetTheme = () => {
    setThemeState(defaultTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resetTheme }}>
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
