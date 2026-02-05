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
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
         <DialogHeader>
           <DialogTitle className="flex items-center gap-2">
             <FileText className="h-5 w-5" />
             {doc.title}
           </DialogTitle>
         </DialogHeader>
 
         <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
           {/* PDF Preview Area */}
           <div className="flex-1 bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
             {/* Sample PDF Preview */}
             <div className="absolute inset-4 bg-white rounded shadow-lg p-8 overflow-auto">
               <div className="max-w-2xl mx-auto space-y-6">
                 {/* Document Header */}
                 <div className="text-center border-b pb-4">
                   <h2 className="text-xl font-bold">{doc.title}</h2>
                   <p className="text-sm text-muted-foreground mt-1">
                     Fecha: {format(doc.createdAt, 'PPP', { locale: es })}
                   </p>
                 </div>
 
                 {/* Document Content */}
                 <div className="prose prose-sm max-w-none">
                   <p>{doc.content}</p>
                   
                   {doc.variables.length > 0 && (
                     <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                       <h4 className="font-medium mb-2">Campos completados:</h4>
                       <ul className="list-disc list-inside space-y-1">
                         {doc.variables.map(v => (
                           <li key={v.key}>
                             <strong>{v.label}:</strong> {v.value || '-'}
                           </li>
                         ))}
                       </ul>
                     </div>
                   )}
                 </div>
 
                 {/* Signatures Section */}
                 <div className="border-t pt-4 mt-8">
                   <h4 className="font-medium mb-4">Firmas</h4>
                   <div className="grid grid-cols-2 gap-4">
                     {doc.signers.map(signer => (
                       <div 
                         key={signer.id} 
                         className={cn(
                           'border rounded-lg p-4',
                           signer.status === 'signed' && 'bg-success/5 border-success',
                           signer.status === 'rejected' && 'bg-destructive/5 border-destructive',
                           signer.status === 'pending' && 'bg-muted border-dashed'
                         )}
                       >
                         <div className="flex items-center gap-2 mb-2">
                           {getSignerStatusIcon(signer.status)}
                           <span className="font-medium">{signer.name}</span>
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
                 </div>
 
                 {/* Document Hash */}
                 {doc.documentHash && (
                   <div className="border-t pt-4 text-center">
                     <p className="text-xs text-muted-foreground font-mono">
                       Hash: {doc.documentHash}
                     </p>
                   </div>
                 )}
               </div>
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
 
           {/* Sidebar with info */}
           <div className="w-64 shrink-0 space-y-4">
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
 
             <div className="space-y-2">
               <Button variant="outline" className="w-full">
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