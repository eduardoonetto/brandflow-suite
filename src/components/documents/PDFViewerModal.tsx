import React, { useState } from 'react';
import { Document as DocType } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Download, 
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  PenLine,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { AuditTimeline } from '@/components/audit/AuditTimeline';
import { AuditEvent } from '@/types';
import { RejectDocumentModal } from './RejectDocumentModal';

const SAMPLE_PDF_URL = 'https://culinaria.group/site/media/ARCHIVO-PDF-DE-PRUEBA.pdf';

interface PDFViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: DocType | null;
  onSign?: () => void;
  onReject?: (reason: string) => void;
}

export function PDFViewerModal({ open, onOpenChange, document: doc, onSign, onReject }: PDFViewerModalProps) {
  const [showRejectModal, setShowRejectModal] = useState(false);

  if (!doc) return null;

  const getSignerInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getSignerStatusIcon = (status: string) => {
    switch (status) {
      case 'signed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-warning" />;
    }
  };

  const showSignButton = doc.status === 'pending' && 
    doc.signers.some(s => (s.userId === 'user-1' || s.email === 'admin@acme.com') && s.status === 'pending');

  // Generate audit events from document data
  const baseEvent: AuditEvent = {
    id: `evt-created-${doc.id}`,
    documentId: doc.id,
    type: 'created' as const,
    timestamp: doc.createdAt,
    actorId: doc.createdBy,
    actorEmail: 'sistema@tufirmaok.cl',
    metadata: {},
  };

  // Add notification events
  const notificationEvents: AuditEvent[] = doc.signers.map((signer, idx): AuditEvent => ({
    id: `evt-notif-${signer.id}`,
    documentId: doc.id,
    type: 'sent',
    timestamp: new Date(new Date(doc.createdAt).getTime() + (idx + 1) * 60000),
    actorId: 'system',
    actorEmail: 'sistema@tufirmaok.cl',
    metadata: {
      recipientEmail: signer.email,
      signerName: signer.name,
    },
  }));

  const signerEvents: AuditEvent[] = doc.signers
    .filter(s => s.status !== 'pending')
    .map((signer): AuditEvent => ({
      id: `evt-sign-${signer.id}`,
      documentId: doc.id,
      type: signer.status === 'signed' ? 'signed' : 'rejected',
      timestamp: signer.signedAt || new Date(),
      actorId: signer.userId || signer.id,
      actorEmail: signer.email,
      metadata: {
        signerName: signer.name,
        signatureMethod: signer.signatureType,
        ...(signer.rejectionReason && { rejectionReason: signer.rejectionReason }),
      },
    }));

  const auditEvents: AuditEvent[] = [baseEvent, ...notificationEvents, ...signerEvents]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const handleDownloadPDF = () => {
    const link = document.createElement('a');
    link.href = SAMPLE_PDF_URL;
    link.download = `${doc.title.replace(/\s+/g, '_')}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReject = (reason: string) => {
    onReject?.(reason);
    setShowRejectModal(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-6xl max-h-[95vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {doc.title}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
            {/* PDF Viewer Area */}
            <div className="flex-1 bg-muted rounded-lg overflow-hidden relative">
              <iframe
                src={`${SAMPLE_PDF_URL}#toolbar=1&navpanes=0`}
                className="w-full h-full min-h-[600px] border-0"
                title="PDF Viewer"
              />
              {/* Watermark for non-signed docs */}
              {doc.status !== 'signed' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-7xl font-bold text-muted-foreground/15 rotate-[-30deg] select-none">
                    {doc.status === 'rejected' ? 'RECHAZADO' : 'BORRADOR'}
                  </span>
                </div>
              )}
            </div>

            {/* Sidebar with info */}
            <div className="w-72 shrink-0 space-y-4 overflow-y-auto">
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-3">Información</h4>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Estado</dt>
                    <dd>
                      <Badge variant={
                        doc.status === 'signed' ? 'default' : 
                        doc.status === 'rejected' ? 'destructive' : 'secondary'
                      }>
                        {doc.status === 'signed' ? 'Firmado' :
                         doc.status === 'rejected' ? 'Rechazado' :
                         doc.status === 'pending' ? 'Pendiente' : 'Borrador'}
                      </Badge>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Creado</dt>
                    <dd>{format(doc.createdAt, 'PPP', { locale: es })}</dd>
                  </div>
                  {doc.finalizedAt && (
                    <div>
                      <dt className="text-muted-foreground">Finalizado</dt>
                      <dd>{format(doc.finalizedAt, 'PPP', { locale: es })}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-3">Firmantes</h4>
                <div className="space-y-2">
                  {doc.signers.map(signer => (
                    <div key={signer.id} className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getSignerInitials(signer.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{signer.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{signer.email}</p>
                      </div>
                      {getSignerStatusIcon(signer.status)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Audit Trail */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-3">Traza del Documento</h4>
                <AuditTimeline events={auditEvents} compact />
              </div>

              <div className="space-y-2">
                <Button variant="outline" className="w-full" onClick={handleDownloadPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Descargar PDF
                </Button>
                {showSignButton && onSign && (
                  <Button className="w-full bg-gradient-primary" onClick={onSign}>
                    <PenLine className="h-4 w-4 mr-2" />
                    Firmar Documento
                  </Button>
                )}
                {showSignButton && onReject && (
                  <Button 
                    variant="destructive" 
                    className="w-full" 
                    onClick={() => setShowRejectModal(true)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rechazar Documento
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <RejectDocumentModal
        open={showRejectModal}
        onOpenChange={setShowRejectModal}
        onConfirm={handleReject}
        documentTitle={doc.title}
      />
    </>
  );
}
