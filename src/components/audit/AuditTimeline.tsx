import React from 'react';
import { AuditEvent } from '@/types';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/utils/formatters';
import { 
  FileText, 
  Send, 
  Mail, 
  Eye, 
  CheckCircle2, 
  XCircle,
  Edit3,
  MapPin,
  Monitor,
  Globe
} from 'lucide-react';

interface AuditTimelineProps {
  events: AuditEvent[];
  compact?: boolean;
}

const eventConfig: Record<AuditEvent['type'], {
  icon: React.ElementType;
  label: string;
  color: string;
}> = {
  created: { icon: FileText, label: 'Creado', color: 'text-primary' },
  sent: { icon: Send, label: 'Enviado', color: 'text-secondary' },
  delivered: { icon: Mail, label: 'Entregado', color: 'text-success' },
  opened: { icon: Eye, label: 'Abierto', color: 'text-warning' },
  signed: { icon: CheckCircle2, label: 'Firmado', color: 'text-success' },
  rejected: { icon: XCircle, label: 'Rechazado', color: 'text-destructive' },
  modified: { icon: Edit3, label: 'Modificado', color: 'text-muted-foreground' },
};

export function AuditTimeline({ events, compact = false }: AuditTimelineProps) {
  if (compact) {
    return (
      <div className="space-y-2">
        {events.map((event) => {
          const config = eventConfig[event.type];
          const Icon = config.icon;
          return (
            <div key={event.id} className="flex items-start gap-2">
              <div className={cn(
                'h-6 w-6 rounded-full flex items-center justify-center shrink-0 border',
                config.color,
                'border-current bg-background'
              )}>
                <Icon className="h-3 w-3" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium truncate">
                  {config.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(event.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border p-6">
      <h3 className="font-semibold mb-6">Historial de Actividad</h3>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[17px] top-2 bottom-2 w-0.5 bg-border" />
        
        {/* Events */}
        <div className="space-y-6">
          {events.map((event) => {
            const config = eventConfig[event.type];
            const Icon = config.icon;
            
            return (
              <div key={event.id} className="relative flex gap-4">
                {/* Icon */}
                <div className={cn(
                  'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 bg-background',
                  config.color,
                  'border-current'
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                
                {/* Content */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{config.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(event.timestamp)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    Por {event.actorEmail}
                  </p>
                  
                  {/* Metadata */}
                  {(event.metadata.ipAddress || event.metadata.userAgent || event.metadata.location || event.metadata.signerName) && (
                    <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
                      {event.metadata.signerName && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Firmante: {event.metadata.signerName}</span>
                        </div>
                      )}
                      {event.metadata.location && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{event.metadata.location}</span>
                        </div>
                      )}
                      {event.metadata.ipAddress && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Globe className="h-3 w-3" />
                          <span>IP: {event.metadata.ipAddress}</span>
                        </div>
                      )}
                      {event.metadata.userAgent && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Monitor className="h-3 w-3" />
                          <span className="truncate">{event.metadata.userAgent.substring(0, 50)}...</span>
                        </div>
                      )}
                      {event.metadata.signatureHash && (
                        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                          <CheckCircle2 className="h-3 w-3" />
                          <span className="truncate">Hash: {event.metadata.signatureHash}</span>
                        </div>
                      )}
                      {event.metadata.signatureMethod && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Método: {event.metadata.signatureMethod === 'pin' ? 'PIN' : 
                                         event.metadata.signatureMethod === 'cedula' ? 'Cédula' : 
                                         event.metadata.signatureMethod}</span>
                        </div>
                      )}
                      {event.metadata.rejectionReason && (
                        <div className="flex items-center gap-2 text-xs text-destructive">
                          <XCircle className="h-3 w-3" />
                          <span>Razón: {event.metadata.rejectionReason}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
