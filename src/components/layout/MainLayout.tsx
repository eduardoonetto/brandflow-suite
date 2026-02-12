import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import eoneLogo from '@/assets/eone-logo.png';

export function MainLayout() {
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-sidebar border-b border-sidebar-border flex items-center px-4">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2 text-sidebar-foreground">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <AppSidebar collapsed={false} onToggle={() => setMobileMenuOpen(false)} />
            </SheetContent>
          </Sheet>
        </header>
        
        <main className="min-h-screen pt-14 flex-1">
          <div className="p-4">
            <Outlet />
          </div>
        </main>

        <footer className="border-t py-3 px-4 flex items-center justify-center gap-2 text-xs text-muted-foreground bg-background">
          <span>Powered by</span>
          <img src={eoneLogo} alt="E-One SpA" className="h-5 w-auto object-contain" />
          <span className="font-medium">E-One SpA</span>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      <main
        className={cn(
          'min-h-screen transition-all duration-300 ease-in-out flex-1',
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        )}
      >
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      <footer className={cn(
        'border-t py-3 px-4 flex items-center justify-center gap-2 text-xs text-muted-foreground bg-background transition-all duration-300',
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      )}>
        <span>Powered by</span>
        <img src={eoneLogo} alt="E-One SpA" className="h-5 w-auto object-contain" />
        <span className="font-medium">E-One SpA</span>
      </footer>
    </div>
  );
}
