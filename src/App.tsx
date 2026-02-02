import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { DocumentProvider } from "@/context/DocumentContext";
import { InstitutionProvider } from "@/context/InstitutionContext";
import { MainLayout } from "@/components/layout/MainLayout";

// Pages
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import DocumentsListPage from "@/pages/DocumentsListPage";
import DocumentEditor from "@/pages/DocumentEditor";
import TemplatesPage from "@/pages/TemplatesPage";
import ReportsPage from "@/pages/ReportsPage";
import UsersPage from "@/pages/UsersPage";
import Settings from "@/pages/Settings";
import InstitutionsAdmin from "@/pages/admin/InstitutionsAdmin";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      <Route element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Documents by status */}
        <Route path="/documents" element={<Navigate to="/documents/pending" replace />} />
        <Route path="/documents/pending" element={<DocumentsListPage initialTab="pending" />} />
        <Route path="/documents/in-progress" element={<DocumentsListPage initialTab="in-progress" />} />
        <Route path="/documents/signed" element={<DocumentsListPage initialTab="signed" />} />
        <Route path="/documents/rejected" element={<DocumentsListPage initialTab="rejected" />} />
        <Route path="/documents/new" element={<DocumentEditor />} />
        <Route path="/documents/:id" element={<DocumentEditor />} />
        <Route path="/documents/:id/edit" element={<DocumentEditor />} />
        
        {/* Templates */}
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/templates/new" element={<DocumentEditor />} />
        <Route path="/templates/:id" element={<DocumentEditor />} />
        <Route path="/templates/:id/edit" element={<DocumentEditor />} />
        
        {/* Reports */}
        <Route path="/reports" element={<ReportsPage />} />
        
        {/* Admin */}
        <Route path="/admin/institutions" element={<InstitutionsAdmin />} />
        <Route path="/admin/users" element={<UsersPage />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <InstitutionProvider>
          <DocumentProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </TooltipProvider>
          </DocumentProvider>
        </InstitutionProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
