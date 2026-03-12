import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FileText, 
  LayoutDashboard, 
  Users, 
  Settings, 
  Building2,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Plus,
  FileStack,
  Clock,
  CheckCircle,
  XCircle,
  FileClock,
  Trash2,
  Shield,
  Mail,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useInstitution } from '@/context/InstitutionContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { InstitutionSelector } from './InstitutionSelector';
import appLogo from '@/assets/app-logo.png';
import codelcoLogo from '@/assets/codelco-logo.png';
import falabellaLogo from '@/assets/falabella-logo.png';

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const institutionLogos: Record<string, string> = {
  'inst-personal': appLogo,
  'inst-acme': codelcoLogo,
  'inst-tech': falabellaLogo,
};

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const { user, logout } = useAuth();
  const { theme, currentSidebarTheme } = useTheme();
  const { isPersonalInstitution, currentInstitution } = useInstitution();
  const navigate = useNavigate();
  const location = useLocation();

  const currentLogo = institutionLogos[currentInstitution?.id || ''] || appLogo;

  const mainNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  ];

  if (!isPersonalInstitution) {
    mainNavItems.push({ icon: FileStack, label: 'Plantillas', path: '/templates' });
    mainNavItems.push({ icon: Mail, label: 'Correos', path: '/email-templates' });
  }

  const documentNavItems = [
    { icon: Clock, label: 'Por Firmar', path: '/documents/pending' },
    { icon: FileClock, label: 'En Proceso', path: '/documents/in-progress' },
    { icon: CheckCircle, label: 'Firmados', path: '/documents/signed' },
    { icon: XCircle, label: 'Rechazados', path: '/documents/rejected' },
  ];

  if (!isPersonalInstitution) {
    documentNavItems.push({ icon: Trash2, label: 'Papelera', path: '/documents/trashed' });
  }

  const superAdminNavItems = user?.role === 'superadmin' ? [
    { icon: Building2, label: 'Instituciones', path: '/admin/institutions' },
  ] : [];

  const adminNavItems = isPersonalInstitution 
    ? [{ icon: Settings, label: 'Configuración', path: '/settings' }]
    : [
        { icon: Users, label: 'Usuarios', path: '/admin/users' },
        { icon: BarChart3, label: 'Reportes', path: '/reports' },
        { icon: Settings, label: 'Configuración', path: '/settings' },
      ];

  const NavItem = ({ icon: Icon, label, path }: { icon: React.ElementType; label: string; path: string }) => {
    const isActive = path.startsWith('/documents/') 
      ? location.pathname === path
      : location.pathname.startsWith(path);

    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      navigate(path);
    };

    const content = (
      <a
        href={path}
        onClick={handleClick}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
          'text-sidebar-foreground/70 hover:text-sidebar-foreground',
          'hover:bg-sidebar-accent',
          isActive && 'bg-sidebar-accent text-sidebar-foreground font-medium',
          collapsed && 'justify-center px-2'
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {!collapsed && <span className="truncate">{label}</span>}
      </a>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">{label}</TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border',
        'flex flex-col transition-all duration-300 ease-in-out sticky overflow-hidden',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Background image overlay for image themes */}
      {currentSidebarTheme.backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none"
          style={{
            backgroundImage: `url(${currentSidebarTheme.backgroundImage})`,
            opacity: currentSidebarTheme.backgroundOpacity || 0.1,
            filter: `blur(${currentSidebarTheme.backgroundBlur || 0}px)`,
          }}
        />
      )}
      {/* Header */}
      <div className={cn(
        'h-16 flex items-center border-b border-sidebar-border px-4',
        collapsed ? 'justify-center' : 'justify-between'
      )}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <img 
              src={currentLogo} 
              alt="Logo" 
              className="h-8 w-auto object-contain max-w-[120px]"
              onError={(e) => { (e.target as HTMLImageElement).src = appLogo; }}
            />
          </div>
        )}
        {collapsed && (
          <img 
            src={currentLogo}
            alt="Logo" 
            className="h-8 w-8 object-contain"
            onError={(e) => { (e.target as HTMLImageElement).src = appLogo; }}
          />
        )}
      </div>

      {/* Institution Selector */}
      {!collapsed && (
        <div className="p-3 border-b border-sidebar-border">
          <InstitutionSelector />
        </div>
      )}

      {/* New Document Button → redirects to /templates */}
      {!isPersonalInstitution && (
        <div className={cn('p-3', collapsed && 'px-2')}>
          <Button 
            onClick={() => navigate('/templates')}
            className={cn(
              'w-full bg-gradient-primary hover:opacity-90 transition-opacity',
              collapsed && 'px-0'
            )}
          >
            <Plus className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Nuevo Documento</span>}
          </Button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-2">
        <div className="space-y-1">
          {mainNavItems.map(item => (
            <NavItem key={item.path} {...item} />
          ))}
        </div>

        {!collapsed && (
          <div className="mt-4 mb-2 px-3">
            <span className="text-xs font-medium text-sidebar-muted uppercase tracking-wider">Documentos</span>
          </div>
        )}
        {collapsed && <div className="my-4 border-t border-sidebar-border" />}
        <div className="space-y-1">
          {documentNavItems.map(item => (
            <NavItem key={item.path} {...item} />
          ))}
        </div>

        {superAdminNavItems.length > 0 && (
          <>
            {!collapsed && (
              <div className="mt-6 mb-2 px-3">
                <span className="text-xs font-medium text-sidebar-muted uppercase tracking-wider">Super Admin</span>
              </div>
            )}
            {collapsed && <div className="my-4 border-t border-sidebar-border" />}
            <div className="space-y-1">
              {superAdminNavItems.map(item => (
                <NavItem key={item.path} {...item} />
              ))}
            </div>
          </>
        )}

        {(user?.role === 'admin' || user?.role === 'superadmin') && (
          <>
            {!collapsed && (
              <div className="mt-6 mb-2 px-3">
                <span className="text-xs font-medium text-sidebar-muted uppercase tracking-wider">Administración</span>
              </div>
            )}
            {collapsed && <div className="my-4 border-t border-sidebar-border" />}
            <div className="space-y-1">
              {adminNavItems.map(item => (
                <NavItem key={item.path} {...item} />
              ))}
            </div>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="h-9 w-9 rounded-full bg-sidebar-accent flex items-center justify-center">
              <span className="text-sm font-medium text-sidebar-foreground">{user.name.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
              <p className="text-xs text-sidebar-muted truncate">{user.email}</p>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className={cn(
              'flex-1 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent',
              collapsed && 'px-0'
            )}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Cerrar Sesión</span>}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent shrink-0"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </aside>
  );
}
