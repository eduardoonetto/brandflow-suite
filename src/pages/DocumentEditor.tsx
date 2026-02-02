import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocuments } from '@/context/DocumentContext';
import { useDocumentVariables } from '@/hooks/useDocumentVariables';
import { VariablePanel } from '@/components/editor/VariablePanel';
import { DocumentPreview } from '@/components/editor/DocumentPreview';
import { SignatureModal } from '@/components/signature/SignatureModal';
import { AuditTimeline } from '@/components/audit/AuditTimeline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  Tag,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuditEvent, DocumentStatus } from '@/types';

// Mock audit events
const mockAuditEvents: AuditEvent[] = [
  {
    id: 'evt-1',
    documentId: 'doc-1',
    type: 'created',
    timestamp: new Date(Date.now() - 86400000 * 3),
    actorId: 'user-1',
    actorEmail: 'admin@acme.com',
    metadata: {},
  },
  {
    id: 'evt-2',
    documentId: 'doc-1',
    type: 'sent',
    timestamp: new Date(Date.now() - 86400000 * 2),
    actorId: 'user-1',
    actorEmail: 'admin@acme.com',
    metadata: { recipientEmail: 'maria@example.com' },
  },
  {
    id: 'evt-3',
    documentId: 'doc-1',
    type: 'delivered',
    timestamp: new Date(Date.now() - 86400000 * 2 + 3600000),
    actorId: 'system',
    actorEmail: 'sistema',
    metadata: {},
  },
  {
    id: 'evt-4',
    documentId: 'doc-1',
    type: 'opened',
    timestamp: new Date(Date.now() - 86400000),
    actorId: 'user-2',
    actorEmail: 'maria@example.com',
    metadata: {
      ipAddress: '190.45.23.112',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: 'Santiago, Chile',
    },
  },
];

export default function DocumentEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { documents, tags, updateDocument, addDocument } = useDocuments();
  
  const isNew = id === 'new';
  const existingDoc = documents.find(d => d.id === id);
  
  const [title, setTitle] = useState(existingDoc?.title || '');
  const [content, setContent] = useState(existingDoc?.content || '');
  const [status, setStatus] = useState<DocumentStatus>(existingDoc?.status || 'draft');
  const [selectedTags, setSelectedTags] = useState<string[]>(
    existingDoc?.tags.map(t => t.id) || []
  );
  const [activeTab, setActiveTab] = useState('edit');
  const [showSignatureModal, setShowSignatureModal] = useState(false);

  const { 
    variables, 
    values, 
    parseContent, 
    setValue, 
    getCompletionPercentage 
  } = useDocumentVariables();

  // Parse content for variables when content changes
  useEffect(() => {
    parseContent(content);
  }, [content, parseContent]);

  // Load existing document values
  useEffect(() => {
    if (existingDoc) {
      const existingValues: Record<string, string> = {};
      existingDoc.variables.forEach(v => {
        if (v.value) existingValues[v.key] = v.value;
      });
      Object.entries(existingValues).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
  }, [existingDoc, setValue]);

  const handleSave = () => {
    const docTags = tags.filter(t => selectedTags.includes(t.id));
    
    if (isNew) {
      addDocument({
        title,
        content,
        status,
        tags: docTags,
        institutionId: 'inst-1',
        createdBy: 'user-1',
        variables: variables.map(v => ({ ...v, value: values[v.key] })),
        signers: [],
        signatures: [],
      });
      navigate('/documents');
    } else {
      updateDocument(id!, {
        title,
        content,
        status,
        tags: docTags,
        variables: variables.map(v => ({ ...v, value: values[v.key] })),
      });
    }
  };

  const handleSignatureComplete = (data: any) => {
    updateDocument(id!, { status: 'signed' });
    setStatus('signed');
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b mb-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/documents')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título del documento"
              className="text-lg font-semibold border-none shadow-none px-0 h-auto focus-visible:ring-0"
            />
            <div className="flex items-center gap-2 mt-1">
              <span className={cn(
                'status-badge',
                status === 'draft' ? 'status-draft' :
                status === 'pending' ? 'status-pending' :
                status === 'signed' ? 'status-signed' :
                'status-rejected'
              )}>
                {status === 'draft' ? 'Borrador' :
                 status === 'pending' ? 'Pendiente' :
                 status === 'signed' ? 'Firmado' :
                 'Rechazado'}
              </span>
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
        
        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={(v) => setStatus(v as DocumentStatus)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Borrador</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="signed">Firmado</SelectItem>
              <SelectItem value="rejected">Rechazado</SelectItem>
            </SelectContent>
          </Select>
          
          {!isNew && status === 'pending' && (
            <Button
              variant="outline"
              onClick={() => setShowSignatureModal(true)}
            >
              <PenLine className="h-4 w-4 mr-2" />
              Firmar
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={handleSave}
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar
          </Button>
          
          {status === 'draft' && (
            <Button
              className="bg-gradient-primary hover:opacity-90"
              onClick={() => {
                handleSave();
                setStatus('pending');
                updateDocument(id!, { status: 'pending' });
              }}
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar a Firmar
            </Button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Editor / Preview area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="mb-4 w-fit">
              <TabsTrigger value="edit" className="gap-2">
                <Edit3 className="h-4 w-4" />
                Editar
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2">
                <Eye className="h-4 w-4" />
                Vista Previa
              </TabsTrigger>
              {!isNew && (
                <TabsTrigger value="history" className="gap-2">
                  <History className="h-4 w-4" />
                  Historial
                </TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="edit" className="flex-1 m-0">
              <div className="h-full flex flex-col gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                    <Tag className="h-3 w-3" />
                    Etiquetas
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <button
                        key={tag.id}
                        onClick={() => toggleTag(tag.id)}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                          selectedTags.includes(tag.id)
                            ? 'ring-2 ring-offset-2 ring-primary/20'
                            : 'opacity-50 hover:opacity-100'
                        )}
                        style={{ 
                          backgroundColor: `hsl(${tag.color} / 0.15)`,
                          color: `hsl(${tag.color})`
                        }}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Contenido del documento
                  </Label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Escriba el contenido del documento aquí. Use {{variable}} para crear campos editables."
                    className="h-full min-h-[400px] resize-none font-mono text-sm"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="flex-1 m-0">
              <DocumentPreview
                content={content}
                variables={values}
                status={status}
                title={title || 'Sin título'}
              />
            </TabsContent>
            
            <TabsContent value="history" className="flex-1 m-0 overflow-y-auto">
              <AuditTimeline events={mockAuditEvents} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Variable panel */}
        <div className="w-80 shrink-0">
          <VariablePanel
            variables={variables}
            values={values}
            onValueChange={setValue}
            completionPercentage={getCompletionPercentage()}
          />
        </div>
      </div>

      {/* Signature Modal */}
      <SignatureModal
        open={showSignatureModal}
        onOpenChange={setShowSignatureModal}
        onComplete={handleSignatureComplete}
        documentTitle={title}
      />
    </div>
  );
}
