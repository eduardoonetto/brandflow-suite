import React, { useState, useRef, useEffect } from 'react';
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
  Loader2,
  CreditCard
} from 'lucide-react';

interface SignatureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: SignatureData) => void;
  documentTitle: string;
}

interface SignatureData {
  method: 'draw' | 'certificate' | 'typed' | 'cedula';
  signatureData: string;
  pin?: string;
  certificatePassword?: string;
  rut?: string;
  serialNumber?: string;
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
  const [signatureMethod, setSignatureMethod] = useState<'draw' | 'certificate' | 'typed' | 'cedula'>('draw');
  const [signatureData, setSignatureData] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [certificateFile, setCertificateFile] = useState<string>('');
  const [certificatePassword, setCertificatePassword] = useState('');
  const [rut, setRut] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Setup canvas with proper DPR scaling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !open) return;
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }, [open, step, signatureMethod]);

  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const touch = e.touches[0];
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pos = getCanvasPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pos = getCanvasPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = 'hsl(var(--foreground))';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      setSignatureData(canvasRef.current.toDataURL());
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pos = getCanvasPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
    ctx.strokeStyle = 'hsl(var(--foreground))';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    setSignatureData('');
  };

  const handleCertificateUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.p12,.pfx';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setCertificateFile(file.name);
        setSignatureData(file.name);
      }
    };
    input.click();
  };

  const handleComplete = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onComplete({
      method: signatureMethod,
      signatureData,
      pin,
      certificatePassword: signatureMethod === 'certificate' ? certificatePassword : undefined,
      rut: signatureMethod === 'cedula' ? rut : undefined,
      serialNumber: signatureMethod === 'cedula' ? serialNumber : undefined,
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
    setCertificateFile('');
    setCertificatePassword('');
    setRut('');
    setSerialNumber('');
  };

  const canProceedIdentity = pin.length >= 4;
  const canProceedSignature = () => {
    if (signatureMethod === 'draw') return signatureData.trim() !== '';
    if (signatureMethod === 'typed') return signatureData.trim() !== '';
    if (signatureMethod === 'certificate') return certificateFile !== '' && certificatePassword.length >= 1;
    if (signatureMethod === 'cedula') return rut.trim() !== '' && serialNumber.trim() !== '';
    return false;
  };

  return (
    <Dialog open={open} onOpenChange={(value) => {
      if (!value) resetModal();
      onOpenChange(value);
    }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Firmar Documento</DialogTitle>
          <DialogDescription>{documentTitle}</DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 py-2">
          {(['identity', 'signature', 'confirm'] as Step[]).map((s, i) => (
            <React.Fragment key={s}>
              <div className={cn(
                'h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                step === s 
                  ? 'bg-primary text-primary-foreground' 
                  : (step === 'confirm' || (step === 'signature' && s === 'identity'))
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
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="draw" className="gap-1 text-xs">
                    <PenLine className="h-3.5 w-3.5" />
                    Dibujar
                  </TabsTrigger>
                  <TabsTrigger value="typed" className="gap-1 text-xs">
                    <Type className="h-3.5 w-3.5" />
                    Escribir
                  </TabsTrigger>
                  <TabsTrigger value="cedula" className="gap-1 text-xs">
                    <CreditCard className="h-3.5 w-3.5" />
                    Cédula
                  </TabsTrigger>
                  <TabsTrigger value="certificate" className="gap-1 text-xs">
                    <FileKey className="h-3.5 w-3.5" />
                    Certificado
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="draw" className="mt-4">
                  <div className="border rounded-lg p-1 bg-muted/30">
                    <canvas
                      ref={canvasRef}
                      style={{ width: '100%', height: '150px' }}
                      className="bg-background rounded cursor-crosshair touch-none"
                      onMouseDown={handlePointerDown}
                      onMouseMove={handlePointerMove}
                      onMouseUp={handlePointerUp}
                      onMouseLeave={handlePointerUp}
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handlePointerUp}
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

                <TabsContent value="cedula" className="mt-4">
                  <div className="space-y-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <CreditCard className="h-8 w-8 mx-auto text-primary mb-2" />
                      <p className="text-sm font-medium">Verificación con Cédula de Identidad</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ingrese su RUT y el número de serie de su cédula (ubicado en el frente, bajo la foto a la derecha)
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>RUT</Label>
                      <Input
                        placeholder="Ej: 12.345.678-9"
                        value={rut}
                        onChange={(e) => setRut(e.target.value)}
                        className="font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Número de Serie del Documento</Label>
                      <Input
                        placeholder="Ej: 100.000.001"
                        value={serialNumber}
                        onChange={(e) => setSerialNumber(e.target.value)}
                        className="font-mono"
                      />
                      <p className="text-xs text-muted-foreground">
                        Se encuentra en el frente de la cédula, en la sección "NÚMERO DOCUMENTO"
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="certificate" className="mt-4">
                  <div className="space-y-4">
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      {certificateFile ? (
                        <div>
                          <p className="text-sm font-medium text-success">{certificateFile}</p>
                          <p className="text-xs text-muted-foreground mt-1">Certificado cargado</p>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm font-medium">Cargar certificado digital</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Formatos aceptados: .p12, .pfx
                          </p>
                        </>
                      )}
                      <Button variant="outline" size="sm" className="mt-3" onClick={handleCertificateUpload}>
                        {certificateFile ? 'Cambiar archivo' : 'Seleccionar archivo'}
                      </Button>
                    </div>
                    {certificateFile && (
                      <div className="space-y-2">
                        <Label>Clave del Certificado</Label>
                        <Input
                          type="password"
                          placeholder="Ingrese la contraseña del certificado"
                          value={certificatePassword}
                          onChange={(e) => setCertificatePassword(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Se requiere la clave para estampar la firma con el certificado digital
                        </p>
                      </div>
                    )}
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
                  <img src={signatureData} alt="Firma" className="max-h-16 mx-auto" />
                )}
                {signatureMethod === 'typed' && (
                  <p className="text-2xl font-serif italic text-center">{signatureData}</p>
                )}
                {signatureMethod === 'certificate' && (
                  <div className="text-center space-y-1">
                    <FileKey className="h-6 w-6 mx-auto text-primary" />
                    <p className="text-sm">Certificado: {certificateFile}</p>
                  </div>
                )}
                {signatureMethod === 'cedula' && (
                  <div className="text-center space-y-1">
                    <CreditCard className="h-6 w-6 mx-auto text-primary" />
                    <p className="text-sm">RUT: {rut}</p>
                    <p className="text-xs text-muted-foreground">Verificación por cédula de identidad</p>
                  </div>
                )}
              </div>

              <div className="bg-muted/30 rounded-lg p-3 text-left">
                <p className="text-xs font-medium mb-1">Método de firma:</p>
                <p className="text-xs text-muted-foreground">
                  {signatureMethod === 'draw' ? 'Firma dibujada manualmente' :
                   signatureMethod === 'typed' ? 'Firma electrónica por nombre' :
                   signatureMethod === 'cedula' ? 'Verificación con Cédula de Identidad chilena' :
                   'Certificado digital (.p12/.pfx)'}
                </p>
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
              disabled={!canProceedSignature()}
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
