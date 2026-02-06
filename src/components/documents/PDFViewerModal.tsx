import React from 'react';
import { Document } from '@/types';
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

interface PDFViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document | null;
  onSign?: () => void;
}

export function PDFViewerModal({ open, onOpenChange, document: doc, onSign }: PDFViewerModalProps) {
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
    actorEmail: 'sistema@dec5.cl',
    metadata: {},
  };

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

  const auditEvents: AuditEvent[] = [baseEvent, ...signerEvents]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const handleDownloadPDF = () => {
    // Create a sample PDF content
    const pdfContent = `
%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 200 >>
stream
BT
/F1 24 Tf
50 700 Td
(${doc.title}) Tj
0 -40 Td
/F1 12 Tf
(Fecha: ${format(doc.createdAt, 'PPP', { locale: es })}) Tj
0 -30 Td
(Estado: ${doc.status === 'signed' ? 'Firmado' : doc.status === 'pending' ? 'Pendiente' : doc.status}) Tj
0 -50 Td
(${doc.content.substring(0, 500)}) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000266 00000 n
0000000519 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
598
%%EOF
`;

    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {doc.title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
          {/* PDF Preview Area - A4 format */}
          <div className="flex-1 bg-muted rounded-lg flex items-center justify-center p-4 overflow-auto">
            {/* A4 Paper simulation (210mm x 297mm ratio) */}
            <div 
              className="bg-white rounded shadow-lg relative flex flex-col"
              style={{ 
                width: '595px', 
                minHeight: '842px',
                aspectRatio: '210 / 297'
              }}
            >
              {/* Content area */}
              <div className="flex-1 p-12 overflow-auto">
                {/* Document Header */}
                <div className="text-center border-b pb-6 mb-6">
                  <h2 className="text-xl font-bold">{doc.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Fecha: {format(doc.createdAt, 'PPP', { locale: es })}
                  </p>
                </div>

                {/* Document Content */}
                <div className="prose prose-sm max-w-none text-sm leading-relaxed">
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: doc.content.replace(/\n/g, '<br/>') 
                    }} 
                  />
                  
                  {doc.variables.length > 0 && (
                    <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2 text-sm">Campos completados:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {doc.variables.map(v => (
                          <li key={v.key}>
                            <strong>{v.label}:</strong> {v.value || '-'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Signatures Section - Always at footer */}
              <div className="border-t p-6 bg-muted/20 mt-auto">
                <h4 className="font-medium mb-4 text-sm text-center">Firmas</h4>
                <div className="grid grid-cols-2 gap-4">
                  {doc.signers.map(signer => (
                    <div 
                      key={signer.id} 
                      className={cn(
                        'border rounded-lg p-3',
                        signer.status === 'signed' && 'bg-success/5 border-success',
                        signer.status === 'rejected' && 'bg-destructive/5 border-destructive',
                        signer.status === 'pending' && 'bg-muted border-dashed'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {getSignerStatusIcon(signer.status)}
                        <span className="font-medium text-sm">{signer.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{signer.email}</p>
                      <p className="text-xs text-muted-foreground">RUT: {signer.rut || '-'}</p>
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {signer.signerType === 'signer' ? (
                          <><PenLine className="h-3 w-3 mr-1" />Firmante</>
                        ) : (
                          <><Eye className="h-3 w-3 mr-1" />Visador</>
                        )}
                      </Badge>
                      {signer.status === 'signed' && signer.signedAt && (
                        <p className="text-xs text-success mt-2">
                          Firmado: {format(signer.signedAt, 'PPp', { locale: es })}
                        </p>
                      )}
                      {signer.status === 'rejected' && signer.rejectionReason && (
                        <p className="text-xs text-destructive mt-2">
                          Razón: {signer.rejectionReason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Document Hash */}
                {doc.documentHash && (
                  <div className="mt-4 pt-4 border-t text-center">
                    <p className="text-xs text-muted-foreground font-mono">
                      Hash: {doc.documentHash}
                    </p>
                  </div>
                )}
              </div>

              {/* Watermark for non-signed docs */}
              {doc.status !== 'signed' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-6xl font-bold text-muted-foreground/10 rotate-[-30deg]">
                    {doc.status === 'rejected' ? 'RECHAZADO' : 'BORRADOR'}
                  </span>
                </div>
              )}
            </div>
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
                {doc.fileSize && (
                  <div>
                    <dt className="text-muted-foreground">Tamaño</dt>
                    <dd>{doc.fileSize}</dd>
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
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
