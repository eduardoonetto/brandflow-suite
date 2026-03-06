import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useDocuments } from '@/context/DocumentContext';
import { useAuth } from '@/context/AuthContext';
import { useDocumentVariables } from '@/hooks/useDocumentVariables';
import { VariablePanel } from '@/components/editor/VariablePanel';
import { DocumentPreview } from '@/components/editor/DocumentPreview';
import { SignatureModal } from '@/components/signature/SignatureModal';
import { AuditTimeline } from '@/components/audit/AuditTimeline';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { TagCreator } from '@/components/documents/TagCreator';
import { SignerConfigModal } from '@/components/documents/SignerConfigModal';
import { TrashDocumentModal } from '@/components/documents/TrashDocumentModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  ArrowLeft, 
  Save, 
  Send, 
  Eye, 
  Edit3,
  PenLine,
  History,
  X,
  Users,
  FileText,
  Trash2,
  UserPlus,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuditEvent, DocumentStatus, DocumentSigner } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { LoadingOverlay } from '@/components/ui/loading-overlay';

// Mock audit events - now dynamically generated based on document
function generateAuditEvents(doc: any, templates: any[]): AuditEvent[] {
  const events: AuditEvent[] = [
    {
      id: 'evt-1',
      documentId: doc?.id || 'doc-1',
      type: 'created',
      timestamp: doc?.createdAt || new Date(Date.now() - 86400000 * 5),
      actorId: doc?.createdBy || 'user-1',
      actorEmail: doc?.createdBy === 'user-1' ? 'admin@acme.com' : 
                  doc?.createdBy === 'user-2' ? 'maria@acme.com' : 
                  doc?.createdBy === 'user-3' ? 'carlos@acme.com' :
                  doc?.createdBy === 'user-4' ? 'ana@acme.com' :
                  doc?.createdBy === 'user-5' ? 'pedro@acme.com' : 'admin@acme.com',
      metadata: {},
    },
  ];

  if (doc?.signers) {
    doc.signers.forEach((signer: DocumentSigner, idx: number) => {
      // Add sent notification
      events.push({
        id: `evt-sent-${idx}`,
        documentId: doc.id,
        type: 'sent',
        timestamp: new Date((doc.createdAt?.getTime() || Date.now()) + 60000 * (idx + 1)),
        actorId: 'system',
        actorEmail: 'sistema',
        metadata: { recipientEmail: signer.email },
      });

      if (signer.status === 'signed' && signer.signedAt) {
        events.push({
          id: `evt-signed-${idx}`,
          documentId: doc.id,
          type: 'signed',
          timestamp: signer.signedAt,
          actorId: signer.userId || signer.id,
          actorEmail: signer.email,
          metadata: { 
            signerName: signer.name, 
            signatureMethod: signer.signatureType,
            ipAddress: '192.168.1.' + (10 + idx),
            location: 'Santiago, Chile',
          },
        });
      }

      if (signer.status === 'rejected' && signer.rejectedAt) {
        events.push({
          id: `evt-rejected-${idx}`,
          documentId: doc.id,
          type: 'rejected',
          timestamp: signer.rejectedAt,
          actorId: signer.userId || signer.id,
          actorEmail: signer.email,
          metadata: { 
            signerName: signer.name,
            rejectionReason: signer.rejectionReason || 'Sin motivo especificado',
            ipAddress: '10.0.0.' + (5 + idx),
          },
        });
      }
    });
  }

  // Add trash event
  if (doc?.status === 'trashed' && doc.trashedAt) {
    events.push({
      id: 'evt-trashed',
      documentId: doc.id,
      type: 'trashed',
      timestamp: doc.trashedAt,
      actorId: doc.createdBy,
      actorEmail: doc.createdBy === 'user-1' ? 'admin@acme.com' : 'unknown@acme.com',
      metadata: { trashReason: doc.trashReason || '' },
    });
  }

  // Sort by timestamp
  events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  return events;
}

const CURRENT_USER_ID = 'user-1';

// Helper to get creator display info
function getCreatorInfo(createdBy: string): { name: string; email: string } {
  const creators: Record<string, { name: string; email: string }> = {
    'user-1': { name: 'John Smith', email: 'admin@acme.com' },
    'user-2': { name: 'María García', email: 'maria@acme.com' },
    'user-3': { name: 'Carlos Rodríguez', email: 'carlos@acme.com' },
    'user-4': { name: 'Ana Torres', email: 'ana@acme.com' },
    'user-5': { name: 'Pedro López', email: 'pedro@acme.com' },
  };
  return creators[createdBy] || { name: 'Usuario desconocido', email: '' };
}

export default function DocumentEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const { documents, templates, tags, updateDocument, addDocument, addTag, updateTemplate } = useDocuments();
  
  const isTemplatePath = location.pathname.startsWith('/templates');
  const templateIdFromQuery = searchParams.get('templateId');
  
  const isNew = id === 'new';
  
  const existingDoc = documents.find(d => d.id === id);
  const existingTemplate = templates.find(t => t.id === id);
  const sourceTemplate = templateIdFromQuery ? templates.find(t => t.id === templateIdFromQuery) : null;
  
  // Determine if this is a PDF-based document
  const isPdfTemplate = existingTemplate?.templateType === 'upload';
  const isDocFromPdfTemplate = existingDoc?.templateId ? templates.find(t => t.id === existingDoc.templateId)?.templateType === 'upload' : false;
  const isPdfMode = isPdfTemplate || isDocFromPdfTemplate;
  
  const entityData = isTemplatePath ? existingTemplate : existingDoc;
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<DocumentStatus>('draft');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState(isPdfMode ? 'preview' : 'edit');
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showSignerModal, setShowSignerModal] = useState(false);
  const [showTrashModal, setShowTrashModal] = useState(false);
  const [configuredSigners, setConfiguredSigners] = useState<Omit<DocumentSigner, 'id' | 'documentId' | 'status'>[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (sourceTemplate) {
      setTitle(sourceTemplate.title);
      setDescription(sourceTemplate.description);
      setContent(sourceTemplate.content);
      setSelectedTags(sourceTemplate.tags.map(t => t.id));
    } else if (entityData) {
      setTitle(entityData.title);
      setDescription('description' in entityData ? entityData.description || '' : '');
      setContent(entityData.content);
      setSelectedTags(entityData.tags?.map(t => t.id) || []);
      if ('status' in entityData) {
        setStatus(entityData.status);
      }
      if ('signers' in entityData && entityData.signers) {
        setConfiguredSigners(entityData.signers.map(s => ({
          email: s.email,
          name: s.name,
          rut: s.rut,
          role: s.role,
          roleId: s.roleId,
          userId: s.userId,
          signerType: s.signerType,
          signatureType: s.signatureType,
          order: s.order,
          notificationType: s.notificationType,
        })));
      }
    }
  }, [entityData, sourceTemplate]);

  // Set active tab when isPdfMode changes
  useEffect(() => {
    if (isPdfMode) setActiveTab('preview');
  }, [isPdfMode]);

  const { 
    variables, 
    values, 
    parseContent, 
    setValue, 
    getCompletionPercentage 
  } = useDocumentVariables();

  useEffect(() => {
    const plainContent = content.replace(/<[^>]+>/g, '');
    parseContent(plainContent);
  }, [content, parseContent]);

  useEffect(() => {
    if (entityData && 'variables' in entityData) {
      const existingValues: Record<string, string> = {};
      entityData.variables.forEach(v => {
        if (v.value) existingValues[v.key] = v.value;
      });
      Object.entries(existingValues).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
  }, [entityData, setValue]);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const docTags = tags.filter(t => selectedTags.includes(t.id));
    
    if (isTemplatePath && existingTemplate) {
      updateTemplate(existingTemplate.id, {
        title,
        description,
        content,
        tags: docTags,
        variables: variables.map(v => ({ ...v, value: values[v.key] })),
      });
      toast({ title: 'Plantilla guardada', description: 'Los cambios han sido guardados' });
    } else if (sourceTemplate || (isNew && !isTemplatePath)) {
      addDocument({
        templateId: sourceTemplate?.id,
        title,
        description,
        content: isPdfMode ? 'Documento PDF subido' : content,
        status: 'pending',
        tags: docTags,
        institutionId: 'inst-acme',
        createdBy: 'user-1',
        variables: variables.map(v => ({ ...v, value: values[v.key] })),
        signers: configuredSigners.map((s, idx) => ({
          ...s,
          id: `signer-${Date.now()}-${idx}`,
          documentId: '',
          status: 'pending' as const,
        })),
        signatures: [],
      });
      toast({ title: 'Documento creado', description: 'El documento ha sido enviado a los firmantes' });
      setIsSaving(false);
      navigate('/documents/pending');
      return;
    } else if (existingDoc) {
      updateDocument(id!, {
        title,
        content,
        status,
        tags: docTags,
        variables: variables.map(v => ({ ...v, value: values[v.key] })),
      });
      toast({ title: 'Documento guardado' });
    }
    setIsSaving(false);
  };

  const handleSendToSign = () => {
    if (configuredSigners.length === 0) {
      setShowSignerModal(true);
      return;
    }
    handleSave();
  };

  const handleSignersConfirmed = (signers: Omit<DocumentSigner, 'id' | 'documentId' | 'status'>[]) => {
    setConfiguredSigners(prev => [...prev, ...signers]);
    setShowSignerModal(false);
    
    // If adding to existing document, also update the document
    if (existingDoc && !isNew) {
      const newSigners = signers.map((s, idx) => ({
        ...s,
        id: `signer-${Date.now()}-${idx}`,
        documentId: existingDoc.id,
        status: 'pending' as const,
      }));
      updateDocument(existingDoc.id, {
        signers: [...existingDoc.signers, ...newSigners],
      });
      toast({ title: 'Firmantes agregados', description: `Se agregaron ${signers.length} firmante(s) al documento` });
    }
  };

  const handleSignatureComplete = (data: any) => {
    updateDocument(id!, { status: 'signed' });
    setStatus('signed');
  };

  const handleTrashConfirm = (reason: string) => {
    if (existingDoc) {
      updateDocument(existingDoc.id, {
        status: 'trashed',
        trashedAt: new Date(),
        trashReason: reason,
      });
      toast({ title: 'Documento enviado a papelera', description: 'El documento ha sido movido a la papelera' });
      navigate('/documents/trashed');
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  const handleTagCreate = (name: string, color: string) => {
    const newTag = addTag(name, color);
    setSelectedTags(prev => [...prev, newTag.id]);
  };

  const showHistoryTab = !isNew && (existingDoc?.signers?.length > 0 || existingDoc?.status === 'trashed');
  const showSendButton = sourceTemplate || (isTemplatePath && existingTemplate);
  const showPdfViewer = isPdfMode && (existingTemplate?.pdfUrl || sourceTemplate?.pdfUrl);
  const pdfUrl = existingTemplate?.pdfUrl || sourceTemplate?.pdfUrl || '/sample.pdf';

  // Can trash: only creator, not fully signed, not already trashed
  const canTrash = existingDoc && 
    existingDoc.createdBy === CURRENT_USER_ID && 
    existingDoc.status !== 'trashed' && 
    existingDoc.status !== 'signed';

  // Can add signer: document exists, not fully signed
  const allSigned = existingDoc?.signers?.every(s => s.status === 'signed') || false;
  const canAddSigner = existingDoc && !isNew && existingDoc.status !== 'trashed' && !allSigned;

  // Creator info
  const creatorInfo = existingDoc ? getCreatorInfo(existingDoc.createdBy) : null;

  // Dynamic audit events
  const auditEvents = existingDoc ? generateAuditEvents(existingDoc, templates) : [];

  if (isSaving) {
    return (
      <div className="h-[calc(100vh-6rem)] flex items-center justify-center">
        <LoadingOverlay message={sourceTemplate ? 'Creando documento y notificando firmantes...' : 'Guardando cambios...'} />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b mb-4 gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título del documento"
              className="text-lg font-semibold border-none shadow-none px-0 h-auto focus-visible:ring-0"
            />
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={cn(
                'status-badge',
                status === 'draft' ? 'status-draft' :
                status === 'pending' ? 'status-pending' :
                status === 'signed' ? 'status-signed' :
                status === 'trashed' ? 'status-draft' :
                'status-rejected'
              )}>
                {isTemplatePath ? 'Plantilla' :
                 status === 'draft' ? 'Borrador' :
                 status === 'pending' ? 'Pendiente' :
                 status === 'signed' ? 'Firmado' :
                 status === 'trashed' ? 'Papelera' :
                 'Rechazado'}
              </span>
              {creatorInfo && !isTemplatePath && !isNew && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Creado por: {creatorInfo.name} ({creatorInfo.email})
                </span>
              )}
              {selectedTags.map(tagId => {
                const tag = tags.find(t => t.id === tagId);
                if (!tag) return null;
                return (
                  <Badge 
                    key={tag.id}
                    variant="secondary"
                    className="text-xs gap-1"
                    style={{ 
                      backgroundColor: `hsl(${tag.color} / 0.15)`,
                      color: `hsl(${tag.color})`
                    }}
                  >
                    {tag.name}
                    <button onClick={() => toggleTag(tag.id)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          {canTrash && (
            <Button variant="outline" size="sm" onClick={() => setShowTrashModal(true)} className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Papelera
            </Button>
          )}

          <Button variant="outline" onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            Guardar
          </Button>
          
          {showSendButton && (
            <Button
              className="bg-gradient-primary hover:opacity-90"
              onClick={handleSendToSign}
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar a Firmar
            </Button>
          )}
          
          {!isNew && status === 'pending' && !isTemplatePath && (
            <Button
              variant="outline"
              onClick={() => setShowSignatureModal(true)}
            >
              <PenLine className="h-4 w-4 mr-2" />
              Firmar
            </Button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Editor / Preview area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <TabsList className="w-fit">
                {!isPdfMode && (
                  <TabsTrigger value="edit" className="gap-2">
                    <Edit3 className="h-4 w-4" />
                    Editar
                  </TabsTrigger>
                )}
                <TabsTrigger value="preview" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Vista Previa
                </TabsTrigger>
                <TabsTrigger value="signers" className="gap-2">
                  <Users className="h-4 w-4" />
                  Firmantes ({configuredSigners.length})
                </TabsTrigger>
                {showHistoryTab && (
                  <TabsTrigger value="history" className="gap-2">
                    <History className="h-4 w-4" />
                    Historial
                  </TabsTrigger>
                )}
              </TabsList>

              <TagCreator
                existingTags={tags}
                selectedTags={selectedTags}
                onTagSelect={toggleTag}
                onTagCreate={handleTagCreate}
              />
            </div>
            
            {!isPdfMode && (
              <TabsContent value="edit" className="flex-1 m-0">
                <div className="h-full flex flex-col gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs text-muted-foreground">
                        Contenido del documento
                      </Label>
                    </div>
                    <RichTextEditor
                      content={content}
                      onChange={setContent}
                      placeholder="Escriba el contenido del documento aquí. Use {{variable}} para crear campos editables."
                    />
                  </div>
                </div>
              </TabsContent>
            )}
            
            <TabsContent value="preview" className="flex-1 m-0">
              {isPdfMode ? (
                <div className="h-full bg-muted rounded-lg overflow-hidden">
                  <iframe
                    src={`${pdfUrl}#toolbar=1&navpanes=0`}
                    className="w-full h-full min-h-[500px] border-0"
                    title="PDF Viewer"
                  />
                </div>
              ) : (
                <DocumentPreview
                  content={content}
                  variables={values}
                  status={status}
                  title={title || 'Sin título'}
                />
              )}
            </TabsContent>

            <TabsContent value="signers" className="flex-1 m-0">
              <div className="space-y-4">
                <div className="text-center py-6">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <h4 className="font-medium">Firmantes del Documento</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isTemplatePath ? 'Configura los firmantes predeterminados de esta plantilla' : 'Define quién debe firmar este documento'}
                  </p>
                </div>

                {configuredSigners.length > 0 && (
                  <div className="border rounded-lg p-4 space-y-2">
                    <p className="text-sm font-medium">{configuredSigners.length} firmante(s) configurado(s)</p>
                    {configuredSigners.map((s, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground p-2 bg-muted/50 rounded">
                        <span className="font-mono bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">{idx + 1}</span>
                        <span className="font-medium text-foreground">{s.name || s.roleId || 'Sin nombre'}</span>
                        <span className="text-xs">({s.signerType === 'signer' ? 'Firmante' : 'Visador'})</span>
                        {s.email && <span className="text-xs ml-auto">{s.email}</span>}
                      </div>
                    ))}
                  </div>
                )}

                <Button onClick={() => setShowSignerModal(true)} className="w-full" variant={configuredSigners.length > 0 ? 'outline' : 'default'}>
                  {canAddSigner ? (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Agregar Firmante
                    </>
                  ) : (
                    <>
                      <Users className="h-4 w-4 mr-2" />
                      {configuredSigners.length > 0 ? 'Modificar Firmantes' : 'Configurar Firmantes'}
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
            
            {showHistoryTab && (
              <TabsContent value="history" className="flex-1 m-0 overflow-y-auto">
                <AuditTimeline events={auditEvents} />
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Variable panel - only show for template-type docs */}
        {!isPdfMode && variables.length > 0 && (
          <div className="w-80 shrink-0">
            <VariablePanel
              variables={variables}
              values={values}
              onValueChange={setValue}
              completionPercentage={getCompletionPercentage()}
            />
          </div>
        )}
      </div>

      <SignatureModal
        open={showSignatureModal}
        onOpenChange={setShowSignatureModal}
        onComplete={handleSignatureComplete}
        documentTitle={title}
      />

      <SignerConfigModal
        open={showSignerModal}
        onOpenChange={setShowSignerModal}
        onConfirm={handleSignersConfirmed}
      />

      <TrashDocumentModal
        open={showTrashModal}
        onOpenChange={setShowTrashModal}
        onConfirm={handleTrashConfirm}
        documentTitle={title}
      />
    </div>
  );
}
