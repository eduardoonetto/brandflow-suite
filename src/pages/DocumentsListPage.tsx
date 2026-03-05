import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocuments } from '@/context/DocumentContext';
import { useInstitution } from '@/context/InstitutionContext';
import { DocumentSignatureCard } from '@/components/documents/DocumentSignatureCard';
import { PDFViewerModal } from '@/components/documents/PDFViewerModal';
import { SignatureModal } from '@/components/signature/SignatureModal';
import { RejectDocumentModal } from '@/components/documents/RejectDocumentModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Search, Clock, FileClock, CheckCircle, XCircle, FileText, Upload, Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Document } from '@/types';
import { CardSkeleton } from '@/components/ui/loading-overlay';

type DocumentTab = 'pending' | 'in-progress' | 'signed' | 'rejected' | 'trashed';

interface DocumentsListPageProps {
  initialTab?: DocumentTab;
}

const CURRENT_USER_ID = 'user-1';
const CURRENT_USER_EMAIL = 'admin@acme.com';

export default function DocumentsListPage({ initialTab = 'pending' }: DocumentsListPageProps) {
  const navigate = useNavigate();
  const { isPersonalInstitution } = useInstitution();
  const { 
    pendingDocuments, 
    inProgressDocuments, 
    signedDocuments, 
    rejectedDocuments,
    documents: allDocuments,
    updateDocument
  } = useDocuments();
  
  const [activeTab, setActiveTab] = useState<DocumentTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoadingDocs(false), 600);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const trashedDocuments = allDocuments.filter(d => d.status === 'trashed');

  // Documents created by user (that they can view even if not a signer)
  const getDocumentsForTab = (): Document[] => {
    let docs: Document[] = [];
    switch (activeTab) {
      case 'pending': docs = pendingDocuments; break;
      case 'in-progress': docs = inProgressDocuments; break;
      case 'signed': docs = signedDocuments; break;
      case 'rejected': docs = rejectedDocuments; break;
      case 'trashed': docs = trashedDocuments; break;
    }

    // Also include documents created by the user (creator can always view)
    if (activeTab !== 'trashed') {
      const createdByUser = allDocuments.filter(doc => {
        if (doc.createdBy === CURRENT_USER_ID && !docs.find(d => d.id === doc.id)) {
          if (activeTab === 'pending' && doc.status === 'pending') return true;
          if (activeTab === 'in-progress' && doc.status === 'pending') {
            // Check if at least one signer signed but not all
            const someSigned = doc.signers.some(s => s.status === 'signed');
            const allSigned = doc.signers.every(s => s.status === 'signed');
            return someSigned && !allSigned;
          }
          if (activeTab === 'signed' && doc.status === 'signed') return true;
          if (activeTab === 'rejected' && doc.status === 'rejected') return true;
        }
        return false;
      });
      docs = [...docs, ...createdByUser];
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      docs = docs.filter(doc => 
        doc.title.toLowerCase().includes(query) ||
        doc.description?.toLowerCase().includes(query)
      );
    }

    // Deduplicate
    const seen = new Set<string>();
    docs = docs.filter(doc => {
      if (seen.has(doc.id)) return false;
      seen.add(doc.id);
      return true;
    });

    return docs;
  };

  const documents = getDocumentsForTab();

  const handleSign = (doc: Document) => {
    setSelectedDocument(doc);
    setShowSignatureModal(true);
  };

  const handleReject = (doc: Document) => {
    setSelectedDocument(doc);
    setShowRejectModal(true);
  };
  
  const handleView = (doc: Document) => {
    setSelectedDocument(doc);
    setShowPDFViewer(true);
  };

  const handleSignatureComplete = () => {
    if (selectedDocument) {
      // Update the specific signer's status
      const updatedSigners = selectedDocument.signers.map(s => {
        if (s.userId === CURRENT_USER_ID || s.email === CURRENT_USER_EMAIL) {
          return { ...s, status: 'signed' as const, signedAt: new Date() };
        }
        return s;
      });

      // Check if all signers have signed
      const allSigned = updatedSigners.every(s => s.status === 'signed');
      const newStatus = allSigned ? 'signed' : 'pending'; // stays pending, will show in "in-progress" for current user

      updateDocument(selectedDocument.id, { 
        signers: updatedSigners,
        status: newStatus,
        ...(allSigned && { finalizedAt: new Date() }),
      });
    }
    setShowSignatureModal(false);
    setSelectedDocument(null);
  };

  const handleRejectConfirm = (reason: string) => {
    if (selectedDocument) {
      const updatedSigners = selectedDocument.signers.map(s => {
        if (s.userId === CURRENT_USER_ID || s.email === CURRENT_USER_EMAIL) {
          return { ...s, status: 'rejected' as const, rejectedAt: new Date(), rejectionReason: reason };
        }
        return s;
      });
      updateDocument(selectedDocument.id, { 
        status: 'rejected',
        signers: updatedSigners,
      });
    }
    setShowRejectModal(false);
    setSelectedDocument(null);
  };

  const tabConfig = [
    { value: 'pending', label: 'Por Firmar', icon: Clock, count: pendingDocuments.length, color: 'text-warning' },
    { value: 'in-progress', label: 'En Proceso', icon: FileClock, count: inProgressDocuments.length, color: 'text-blue-500' },
    { value: 'signed', label: 'Firmados', icon: CheckCircle, count: signedDocuments.length, color: 'text-success' },
    { value: 'rejected', label: 'Rechazados', icon: XCircle, count: rejectedDocuments.length, color: 'text-destructive' },
    ...(!isPersonalInstitution ? [{ value: 'trashed', label: 'Papelera', icon: Trash2, count: trashedDocuments.length, color: 'text-muted-foreground' }] : []),
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Documentos</h1>
          <p className="text-muted-foreground">Administra y firma tus documentos de forma digital</p>
        </div>
        
        {!isPersonalInstitution && (
          <Button onClick={() => navigate('/templates')} className="bg-gradient-primary hover:opacity-90">
            <Upload className="h-4 w-4 mr-2" />
            Nuevo Documento
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar documentos..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="bg-warning/5 border-warning/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div><p className="text-2xl font-bold">{pendingDocuments.length}</p><p className="text-sm text-muted-foreground">Por Firmar</p></div>
            <Clock className="h-8 w-8 text-warning" />
          </CardContent>
        </Card>
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div><p className="text-2xl font-bold">{inProgressDocuments.length}</p><p className="text-sm text-muted-foreground">En Proceso</p></div>
            <FileClock className="h-8 w-8 text-blue-500" />
          </CardContent>
        </Card>
        <Card className="bg-success/5 border-success/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div><p className="text-2xl font-bold">{signedDocuments.length}</p><p className="text-sm text-muted-foreground">Firmados</p></div>
            <CheckCircle className="h-8 w-8 text-success" />
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as DocumentTab)}>
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          {tabConfig.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <tab.icon className={cn('h-3 w-3 sm:h-4 sm:w-4', tab.color)} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              <span className={cn('ml-1 px-1.5 py-0.5 rounded-full text-xs font-medium', activeTab === tab.value ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')}>
                {tab.count}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {tabConfig.map(tab => (
          <TabsContent key={tab.value} value={tab.value} className="mt-0">
            {isLoadingDocs ? (
              <CardSkeleton count={4} />
            ) : documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-1">No hay documentos</h3>
                <p className="text-muted-foreground text-sm">No tienes documentos en esta categoría</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <DocumentSignatureCard
                    key={doc.id}
                    document={doc}
                    showSignButton={activeTab === 'pending'}
                    showRejectButton={activeTab === 'pending'}
                    onSign={() => handleSign(doc)}
                    onReject={() => handleReject(doc)}
                    onView={() => handleView(doc)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <SignatureModal
        open={showSignatureModal}
        onOpenChange={setShowSignatureModal}
        onComplete={handleSignatureComplete}
        documentTitle={selectedDocument?.title || ''}
      />

      <RejectDocumentModal
        open={showRejectModal}
        onOpenChange={setShowRejectModal}
        onConfirm={handleRejectConfirm}
        documentTitle={selectedDocument?.title || ''}
      />

      <PDFViewerModal
        open={showPDFViewer}
        onOpenChange={setShowPDFViewer}
        document={selectedDocument}
        onSign={() => {
          setShowPDFViewer(false);
          if (selectedDocument) handleSign(selectedDocument);
        }}
        onReject={(reason) => {
          setShowPDFViewer(false);
          handleRejectConfirm(reason);
        }}
      />
    </div>
  );
}
