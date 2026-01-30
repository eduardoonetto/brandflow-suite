import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  PenLine, 
  FileKey, 
  Type, 
  Check, 
  ArrowLeft, 
  ArrowRight,
  Upload,
  Shield,
  Loader2
} from 'lucide-react';

interface SignatureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: SignatureData) => void;
  documentTitle: string;
}

interface SignatureData {
  method: 'draw' | 'certificate' | 'typed';
  signatureData: string;
  pin?: string;
}

type Step = 'identity' | 'signature' | 'confirm';

export function SignatureModal({ 
  open, 
  onOpenChange, 
  onComplete,
  documentTitle 
}: SignatureModalProps) {
  const [step, setStep] = useState<Step>('identity');
  const [pin, setPin] = useState('');
  const [signatureMethod, setSignatureMethod] = useState<'draw' | 'certificate' | 'typed'>('draw');
  const [signatureData, setSignatureData] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = 'hsl(var(--foreground))';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      setSignatureData(canvasRef.current.toDataURL());
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData('');
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onComplete({
      method: signatureMethod,
      signatureData,
      pin,
    });
    
    setIsLoading(false);
    onOpenChange(false);
    resetModal();
  };

  const resetModal = () => {
    setStep('identity');
    setPin('');
    setSignatureMethod('draw');
    setSignatureData('');
    clearCanvas();
  };

  const canProceedIdentity = pin.length >= 4;
  const canProceedSignature = signatureData.trim() !== '';

  return (
    <Dialog open={open} onOpenChange={(value) => {
      if (!value) resetModal();
      onOpenChange(value);
    }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Firmar Documento</DialogTitle>
          <DialogDescription>
            {documentTitle}
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 py-2">
          {(['identity', 'signature', 'confirm'] as Step[]).map((s, i) => (
            <React.Fragment key={s}>
              <div className={cn(
                'h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                step === s 
                  ? 'bg-primary text-primary-foreground' 
                  : s === 'confirm' && step === 'signature'
                    ? 'bg-muted text-muted-foreground'
                    : step === 'confirm' || (step === 'signature' && s === 'identity')
                      ? 'bg-success text-success-foreground'
                      : 'bg-muted text-muted-foreground'
              )}>
                {(step === 'confirm' || (step === 'signature' && s === 'identity')) && s !== step ? (
                  <Check className="h-4 w-4" />
                ) : (
                  i + 1
                )}
              </div>
              {i < 2 && <div className="h-0.5 w-12 bg-muted" />}
            </React.Fragment>
          ))}
        </div>

        {/* Step content */}
        <div className="py-4">
          {step === 'identity' && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Shield className="h-12 w-12 mx-auto text-primary mb-3" />
                <h4 className="font-medium mb-1">Verificación de Identidad</h4>
                <p className="text-sm text-muted-foreground">
                  Ingrese el PIN que recibió por correo electrónico
                </p>
              </div>
              
              <div>
                <Label>PIN de Verificación</Label>
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="Ingrese el PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="text-center text-2xl tracking-widest font-mono"
                />
              </div>

              <div className="text-center">
                <button className="text-sm text-primary hover:underline">
                  ¿No recibió el PIN? Reenviar
                </button>
              </div>
            </div>
          )}

          {step === 'signature' && (
            <div className="space-y-4">
              <Tabs value={signatureMethod} onValueChange={(v) => setSignatureMethod(v as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="draw" className="gap-2">
                    <PenLine className="h-4 w-4" />
                    Dibujar
                  </TabsTrigger>
                  <TabsTrigger value="typed" className="gap-2">
                    <Type className="h-4 w-4" />
                    Escribir
                  </TabsTrigger>
                  <TabsTrigger value="certificate" className="gap-2">
                    <FileKey className="h-4 w-4" />
                    Certificado
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="draw" className="mt-4">
                  <div className="border rounded-lg p-1 bg-muted/30">
                    <canvas
                      ref={canvasRef}
                      width={400}
                      height={150}
                      className="w-full bg-background rounded cursor-crosshair"
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    />
                  </div>
                  <div className="flex justify-end mt-2">
                    <Button variant="ghost" size="sm" onClick={clearCanvas}>
                      Limpiar
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="typed" className="mt-4">
                  <Input
                    placeholder="Escriba su nombre completo"
                    value={signatureData}
                    onChange={(e) => setSignatureData(e.target.value)}
                    className="text-2xl h-14 font-serif italic text-center"
                  />
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Su nombre será usado como firma electrónica
                  </p>
                </TabsContent>
                
                <TabsContent value="certificate" className="mt-4">
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Cargar certificado digital</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Formatos aceptados: .p12, .pfx
                    </p>
                    <Button variant="outline" size="sm" className="mt-4">
                      Seleccionar archivo
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-4 text-center">
              <div className="p-4 bg-success/10 rounded-lg">
                <Check className="h-12 w-12 mx-auto text-success mb-3" />
                <h4 className="font-medium mb-1">Confirmar Firma</h4>
                <p className="text-sm text-muted-foreground">
                  Al confirmar, su firma será legalmente vinculante
                </p>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4 text-left">
                <p className="text-xs text-muted-foreground mb-2">Vista previa de firma:</p>
                {signatureMethod === 'draw' && signatureData && (
                  <img 
                    src={signatureData} 
                    alt="Firma" 
                    className="max-h-16 mx-auto"
                  />
                )}
                {signatureMethod === 'typed' && (
                  <p className="text-2xl font-serif italic text-center">
                    {signatureData}
                  </p>
                )}
                {signatureMethod === 'certificate' && (
                  <p className="text-sm text-center">
                    Certificado digital cargado
                  </p>
                )}
              </div>
              
              <p className="text-xs text-muted-foreground">
                Se generará un hash criptográfico único para este documento
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between pt-4 border-t">
          {step !== 'identity' ? (
            <Button 
              variant="ghost" 
              onClick={() => setStep(step === 'confirm' ? 'signature' : 'identity')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Atrás
            </Button>
          ) : (
            <div />
          )}
          
          {step === 'identity' && (
            <Button 
              onClick={() => setStep('signature')}
              disabled={!canProceedIdentity}
            >
              Continuar
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
          
          {step === 'signature' && (
            <Button 
              onClick={() => setStep('confirm')}
              disabled={!canProceedSignature}
            >
              Continuar
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
          
          {step === 'confirm' && (
            <Button 
              onClick={handleComplete}
              disabled={isLoading}
              className="bg-gradient-primary"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Firmar Documento
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
