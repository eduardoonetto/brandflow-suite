import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Document, DocumentSigner } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { 
  FileText, 
  Eye, 
  Download, 
  PenLine,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DocumentSignatureCardProps {
  document: Document;
  showSignButton?: boolean;
  showRejectButton?: boolean;
  showTrashButton?: boolean;
  onSign?: () => void;
  onReject?: () => void;
  onView?: () => void;
  onTrash?: () => void;
}

export function DocumentSignatureCard({ 
  document, 
  showSignButton = true,
  showRejectButton = false,
  showTrashButton = false,
  onSign,
  onReject,
  onView,
  onTrash
}: DocumentSignatureCardProps) {
  const navigate = useNavigate();

  const getStatusBadge = () => {
    const pendingSigners = document.signers.filter(s => s.status === 'pending').length;
    
    if (document.status === 'trashed') {
      return (
        <Badge className="bg-muted text-muted-foreground border-0">
          <Trash2 className="h-3 w-3 mr-1" />
          Papelera
        </Badge>
      );
    }
    if (document.status === 'signed') {
      return (
        <Badge className="bg-success/15 text-success border-0">
          <CheckCircle className="h-3 w-3 mr-1" />
          Firmado
        </Badge>
      );
    }
    if (document.status === 'rejected') {
      return (
        <Badge className="bg-destructive/15 text-destructive border-0">
          <XCircle className="h-3 w-3 mr-1" />
          Rechazado
        </Badge>
      );
    }
    if (pendingSigners > 0) {
      return (
        <Badge className="bg-warning/15 text-warning border-0">
          <Clock className="h-3 w-3 mr-1" />
          Por Firmar
        </Badge>
      );
    }
    return null;
  };

  const getSignerInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getSignerStatusColor = (signer: DocumentSigner) => {
    switch (signer.status) {
      case 'signed':
        return 'border-success bg-success/10';
      case 'rejected':
        return 'border-destructive bg-destructive/10';
      default:
        return 'border-muted-foreground/30 bg-muted';
    }
  };

  const pendingSigners = document.signers.filter(s => s.status === 'pending');

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold truncate">{document.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {document.description}
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tags and metadata */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {document.tags.map(tag => (
            <Badge 
              key={tag.id} 
              variant="secondary"
              style={{ 
                backgroundColor: `hsl(${tag.color} / 0.15)`,
                color: `hsl(${tag.color})`
              }}
            >
              {tag.name}
            </Badge>
          ))}
          {document.fileSize && <span>{document.fileSize}</span>}
          <span>{format(document.createdAt, 'd MMM yyyy', { locale: es })}</span>
        </div>

        {/* Signers */}
        {pendingSigners.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" />
              Requiere firma de:
            </p>
            <div className="flex flex-wrap gap-2">
              {pendingSigners.map(signer => (
                <div
                  key={signer.id}
                  className={cn(
                    'flex items-center gap-2 px-2 py-1 rounded-full border',
                    getSignerStatusColor(signer)
                  )}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {getSignerInitials(signer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{signer.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All signers for completed docs */}
        {document.status === 'signed' && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Firmado por:
            </p>
            <div className="flex flex-wrap gap-2">
              {document.signers.map(signer => (
                <div
                  key={signer.id}
                  className={cn(
                    'flex items-center gap-2 px-2 py-1 rounded-full border',
                    getSignerStatusColor(signer)
                  )}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {getSignerInitials(signer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{signer.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trash reason for trashed docs */}
        {document.status === 'trashed' && document.trashReason && (
          <div className="bg-muted/50 rounded-lg p-3 flex items-start gap-2">
            <Trash2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-muted-foreground">Motivo de papelera:</p>
              <p className="text-xs text-muted-foreground">{document.trashReason}</p>
            </div>
          </div>
        )}

        {/* Rejection reason for rejected docs */}
        {document.status === 'rejected' && document.signers.filter(s => s.status === 'rejected').map(s => (
          <div key={s.id} className="bg-destructive/5 rounded-lg p-3 flex items-start gap-2">
            <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-destructive">Rechazado por {s.name}:</p>
              <p className="text-xs text-muted-foreground">{s.rejectionReason || 'Sin motivo'}</p>
            </div>
          </div>
        ))}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={onView || (() => navigate(`/documents/${document.id}`))}
          >
            <Eye className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Ver</span>
          </Button>
          {showSignButton && document.status === 'pending' && (
            <Button 
              size="sm" 
              className="flex-1 bg-gradient-primary hover:opacity-90"
              onClick={onSign}
            >
              <PenLine className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Firmar</span>
            </Button>
          )}
          {showRejectButton && document.status === 'pending' && (
            <Button 
              size="sm" 
              variant="destructive"
              className="flex-1"
              onClick={onReject}
            >
              <XCircle className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Rechazar</span>
            </Button>
          )}
          {showTrashButton && (
            <Button
              size="sm"
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={onTrash}
            >
              <Trash2 className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Papelera</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
