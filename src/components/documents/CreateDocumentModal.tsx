import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocuments } from '@/context/DocumentContext';
import { useInstitution } from '@/context/InstitutionContext';
import { SignerConfigModal } from './SignerConfigModal';
import { DocumentSigner, DocumentTemplate, TemplateType, Tag } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileText, 
  Upload, 
  Users,
  ArrowRight,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: 'template' | 'document';
  showSignerConfig?: boolean;
}

export function CreateDocumentModal({ 
  open, 
  onOpenChange, 
  mode = 'document',
  showSignerConfig = true 
}: CreateDocumentModalProps) {
  const navigate = useNavigate();
  const { templates, addDocument, addTemplate } = useDocuments();
  const { isPersonalInstitution, currentInstitution } = useInstitution();

  const [step, setStep] = useState<'type' | 'config' | 'signers'>('type');
  const [documentType, setDocumentType] = useState<TemplateType>('template');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [showSignerModal, setShowSignerModal] = useState(false);
  const [configuredSigners, setConfiguredSigners] = useState<Omit<DocumentSigner, 'id' | 'documentId' | 'status'>[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine if we need to show signers step
  const needsSignerStep = mode === 'document' || (mode === 'template' && showSignerConfig);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setTitle(file.name.replace('.pdf', ''));
    }
  };

  const handleSignersConfirmed = (signers: Omit<DocumentSigner, 'id' | 'documentId' | 'status'>[]) => {
    setConfiguredSigners(signers);
    setShowSignerModal(false);
  };

  const handleCreate = () => {
    if (mode === 'template') {
      addTemplate({
        title,
        description,
        templateType: documentType,
        content: documentType === 'template' ? content : '',
        pdfUrl: documentType === 'upload' ? URL.createObjectURL(pdfFile!) : undefined,
        category: 'General',
        tags: [],
        institutionId: currentInstitution?.id || '',
        createdBy: 'user-1',
        variables: [],
        isActive: true,
      });
      onOpenChange(false);
      navigate('/templates');
    } else {
      const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
      addDocument({
        templateId: selectedTemplateId || undefined,
        title: title || selectedTemplate?.title || 'Documento sin título',
        description,
        content: documentType === 'template' 
          ? (selectedTemplate?.content || content)
          : 'Documento PDF subido',
        status: 'pending',
        tags: [],
        institutionId: currentInstitution?.id || '',
        createdBy: 'user-1',
        variables: [],
        signers: configuredSigners.map((s, idx) => ({
          ...s,
          id: `signer-${Date.now()}-${idx}`,
          documentId: '',
          status: 'pending' as const,
        })),
        signatures: [],
      });
      onOpenChange(false);
      navigate('/documents/pending');
    }
    resetForm();
  };

  const resetForm = () => {
    setStep('type');
    setDocumentType('template');
    setSelectedTemplateId('');
    setTitle('');
    setDescription('');
    setContent('');
    setPdfFile(null);
    setConfiguredSigners([]);
  };

  // Personal institutions can't create documents or templates
  if (isPersonalInstitution) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>No disponible</DialogTitle>
            <DialogDescription>
              Solo las instituciones organizacionales pueden crear documentos y plantillas.
              Cambia a una institución para continuar.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Entendido</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const canProceedToSigners = needsSignerStep && (
    (documentType === 'template' && (mode === 'template' ? (title && content) : selectedTemplateId)) ||
    (documentType === 'upload' && pdfFile && title)
  );

  const canCreate = needsSignerStep
    ? (configuredSigners.length > 0)
    : (title && (documentType === 'upload' ? pdfFile : content));

  const totalSteps = needsSignerStep ? 3 : 2;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {mode === 'template' ? 'Nueva Plantilla' : 'Nuevo Documento'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'template' 
                ? 'Crea una plantilla reutilizable para tus documentos'
                : 'Selecciona el tipo de documento y configura los firmantes'
              }
            </DialogDescription>
          </DialogHeader>

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 py-2">
            <div className={cn(
              'h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium',
              step === 'type' ? 'bg-primary text-primary-foreground' : 'bg-success text-success-foreground'
            )}>
              {step !== 'type' ? <Check className="h-4 w-4" /> : '1'}
            </div>
            <div className="h-0.5 w-8 bg-muted" />
            <div className={cn(
              'h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium',
              step === 'config' ? 'bg-primary text-primary-foreground' : 
              step === 'signers' ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'
            )}>
              {step === 'signers' ? <Check className="h-4 w-4" /> : '2'}
            </div>
            {needsSignerStep && (
              <>
                <div className="h-0.5 w-8 bg-muted" />
                <div className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium',
                  step === 'signers' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}>
                  3
                </div>
              </>
            )}
          </div>

          <div className="py-4">
            {step === 'type' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Selecciona el tipo de {mode === 'template' ? 'plantilla' : 'documento'}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setDocumentType('template')}
                    className={cn(
                      'p-4 rounded-lg border-2 text-left transition-all',
                      documentType === 'template' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-muted hover:border-primary/50'
                    )}
                  >
                    <FileText className="h-8 w-8 mb-2 text-primary" />
                    <h4 className="font-medium">Con Variables</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {mode === 'template' 
                        ? 'Crea una plantilla con campos dinámicos {{variable}}'
                        : 'Usar una plantilla existente y completar campos'
                      }
                    </p>
                  </button>
                  <button
                    onClick={() => setDocumentType('upload')}
                    className={cn(
                      'p-4 rounded-lg border-2 text-left transition-all',
                      documentType === 'upload' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-muted hover:border-primary/50'
                    )}
                  >
                    <Upload className="h-8 w-8 mb-2 text-primary" />
                    <h4 className="font-medium">Subir PDF</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Sube un documento PDF ya completado
                    </p>
                  </button>
                </div>
              </div>
            )}

            {step === 'config' && (
              <div className="space-y-4">
                {documentType === 'template' && mode === 'document' && (
                  <div>
                    <Label>Seleccionar Plantilla</Label>
                    <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione una plantilla" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.filter(t => t.templateType === 'template').map(t => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {documentType === 'upload' && (
                  <div>
                    <Label>Archivo PDF</Label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                        pdfFile ? 'border-success bg-success/5' : 'border-muted hover:border-primary/50'
                      )}
                    >
                      {pdfFile ? (
                        <div>
                          <Check className="h-8 w-8 mx-auto text-success mb-2" />
                          <p className="font-medium">{pdfFile.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <div>
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Haz clic para seleccionar un archivo PDF
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Always show title and description for templates */}
                <div>
                  <Label>{mode === 'template' ? 'Título' : 'Título del documento (opcional)'}</Label>
                  <Input
                    placeholder={mode === 'template' ? "Nombre de la plantilla" : "Dejar vacío para usar título de plantilla"}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                
                {mode === 'template' && (
                  <>
                    <div>
                      <Label>Descripción</Label>
                      <Input
                        placeholder="Descripción breve"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                    {documentType === 'template' && (
                      <div>
                        <Label>Contenido</Label>
                        <Textarea
                          placeholder="Escriba el contenido. Use {{variable}} para campos dinámicos."
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          className="min-h-[150px] font-mono text-sm"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {step === 'signers' && needsSignerStep && (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <h4 className="font-medium">Configura los Firmantes</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Define quién debe firmar o visar este documento
                  </p>
                </div>

                {configuredSigners.length > 0 && (
                  <div className="border rounded-lg p-4 space-y-2">
                    <p className="text-sm font-medium">{configuredSigners.length} firmante(s) configurado(s)</p>
                    {configuredSigners.map((s, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-mono bg-muted px-2 py-0.5 rounded">{idx + 1}</span>
                        <span>{s.name || s.roleId || 'Sin nombre'}</span>
                        <span className="text-xs">({s.signerType === 'signer' ? 'Firmante' : 'Visador'})</span>
                      </div>
                    ))}
                  </div>
                )}

                <Button 
                  onClick={() => setShowSignerModal(true)} 
                  className="w-full"
                  variant={configuredSigners.length > 0 ? 'outline' : 'default'}
                >
                  <Users className="h-4 w-4 mr-2" />
                  {configuredSigners.length > 0 ? 'Modificar Firmantes' : 'Configurar Firmantes'}
                </Button>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {step !== 'type' && (
              <Button 
                variant="outline" 
                onClick={() => setStep(step === 'signers' ? 'config' : 'type')}
              >
                Atrás
              </Button>
            )}
            {step === 'type' && (
              <Button onClick={() => setStep('config')}>
                Continuar
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
            {step === 'config' && !needsSignerStep && (
              <Button onClick={handleCreate} disabled={!canCreate}>
                {mode === 'template' ? 'Crear Plantilla' : 'Crear Documento'}
              </Button>
            )}
            {step === 'config' && needsSignerStep && (
              <Button onClick={() => setStep('signers')} disabled={!canProceedToSigners}>
                Continuar
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
            {step === 'signers' && (
              <Button onClick={handleCreate} disabled={!canCreate}>
                {mode === 'template' ? 'Crear Plantilla' : 'Crear Documento'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SignerConfigModal
        open={showSignerModal}
        onOpenChange={setShowSignerModal}
        onConfirm={handleSignersConfirmed}
      />
    </>
  );
}
