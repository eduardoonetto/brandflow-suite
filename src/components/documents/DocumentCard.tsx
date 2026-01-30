import React from 'react';
import { Document, DocumentStatus } from '@/types';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Edit3,
  MoreHorizontal,
  Send,
  Eye,
  Trash2,
  Copy
} from 'lucide-react';
import { formatRelativeTime } from '@/utils/formatters';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface DocumentCardProps {
  document: Document;
  selected: boolean;
  onSelect: () => void;
  onEdit?: () => void;
  onView?: () => void;
  onSend?: () => void;
  onDelete?: () => void;
}

const statusConfig: Record<DocumentStatus, { 
  label: string; 
  icon: React.ElementType; 
  className: string;
}> = {
  draft: { 
    label: 'Borrador', 
    icon: Edit3, 
    className: 'status-draft' 
  },
  pending: { 
    label: 'Pendiente', 
    icon: Clock, 
    className: 'status-pending' 
  },
  signed: { 
    label: 'Firmado', 
    icon: CheckCircle2, 
    className: 'status-signed' 
  },
  rejected: { 
    label: 'Rechazado', 
    icon: XCircle, 
    className: 'status-rejected' 
  },
};

export function DocumentCard({ 
  document, 
  selected, 
  onSelect, 
  onEdit,
  onView,
  onSend,
  onDelete 
}: DocumentCardProps) {
  const status = statusConfig[document.status];
  const StatusIcon = status.icon;

  return (
    <div
      className={cn(
        'group relative bg-card rounded-xl border p-4 transition-all duration-200',
        'hover:shadow-lg hover:border-primary/20 card-interactive',
        selected && 'ring-2 ring-primary border-primary'
      )}
    >
      {/* Selection checkbox */}
      <div 
        className="absolute left-4 top-4 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox 
          checked={selected} 
          onCheckedChange={onSelect}
          className="border-muted-foreground/30"
        />
      </div>

      {/* Content */}
      <div className="ml-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-primary shrink-0" />
              <h3 className="font-medium text-foreground truncate">
                {document.title}
              </h3>
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {document.content.substring(0, 120)}...
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {document.tags.map(tag => (
                <Badge 
                  key={tag.id} 
                  variant="secondary"
                  className="text-xs"
                  style={{ 
                    backgroundColor: `hsl(${tag.color} / 0.15)`,
                    color: `hsl(${tag.color})`
                  }}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className={cn('status-badge', status.className)}>
                <StatusIcon className="h-3.5 w-3.5" />
                <span>{status.label}</span>
              </div>
              
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(document.updatedAt)}
              </span>
            </div>
          </div>

          {/* Actions menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onView}>
                <Eye className="h-4 w-4 mr-2" />
                Ver documento
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Edit3 className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onSend}>
                <Send className="h-4 w-4 mr-2" />
                Enviar a firmar
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="h-4 w-4 mr-2" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
