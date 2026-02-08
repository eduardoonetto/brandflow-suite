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
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';

interface TrashDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  documentTitle: string;
}

export function TrashDocumentModal({ 
  open, 
  onOpenChange, 
  onConfirm,
  documentTitle 
}: TrashDocumentModalProps) {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTrash = async () => {
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
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Enviar a Papelera
          </DialogTitle>
          <DialogDescription>
            {documentTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">
                ¿Enviar documento a la papelera?
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Solo se pueden enviar a la papelera documentos que no hayan sido firmados 
                por ningún participante.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Motivo *</Label>
            <Textarea
              id="reason"
              placeholder="Explique por qué envía este documento a la papelera..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleTrash}
            disabled={isLoading || !reason.trim()}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Enviar a Papelera
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
