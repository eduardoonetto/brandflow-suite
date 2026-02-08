import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { XCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface RejectDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  documentTitle: string;
}

export function RejectDocumentModal({ 
  open, 
  onOpenChange, 
  onConfirm,
  documentTitle 
}: RejectDocumentModalProps) {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleReject = async () => {
    if (!reason.trim()) return;
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    onConfirm(reason);
    setIsLoading(false);
    setReason('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            Rechazar Documento
          </DialogTitle>
          <DialogDescription>
            {documentTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-destructive">
                Esta acción es irreversible
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Al rechazar este documento, se interrumpirá el flujo de firmas por completo. 
                El documento no podrá recibir nuevas firmas.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Motivo del rechazo *</Label>
            <Textarea
              id="reason"
              placeholder="Explique el motivo por el cual rechaza este documento..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              Este motivo será visible para todos los participantes del documento.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            variant="destructive"
            onClick={handleReject}
            disabled={isLoading || !reason.trim()}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4 mr-2" />
            )}
            Rechazar Documento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
