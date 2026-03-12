import React, { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDocuments } from '@/context/DocumentContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Plus,
  GripVertical,
  Type,
  Image,
  Minus,
  Square,
  Trash2,
  Save,
  Mail,
  FileText,
  ArrowLeft,
  Link2,
  Edit3,
  Eye,
  Variable,
  LayoutTemplate,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Email block types
type BlockType = 'header' | 'text' | 'image' | 'button' | 'divider' | 'spacer';

interface EmailBlock {
  id: string;
  type: BlockType;
  content: string;
  styles?: Record<string, string>;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  associatedTemplateId?: string;
  blocks: EmailBlock[];
  createdAt: Date;
}

const blockTypes: { type: BlockType; icon: React.ElementType; label: string }[] = [
  { type: 'header', icon: Type, label: 'Encabezado' },
  { type: 'text', icon: FileText, label: 'Texto' },
  { type: 'image', icon: Image, label: 'Imagen' },
  { type: 'button', icon: Square, label: 'Botón' },
  { type: 'divider', icon: Minus, label: 'Divisor' },
  { type: 'spacer', icon: Square, label: 'Espaciador' },
];

function getDefaultContent(type: BlockType): string {
  switch (type) {
    case 'header': return 'Título del correo';
    case 'text': return 'Hola {{nombre}}, este es el contenido del correo electrónico.';
    case 'image': return 'https://via.placeholder.com/600x200';
    case 'button': return 'Ver Documento';
    case 'divider': return '';
    case 'spacer': return '';
    default: return '';
  }
}

// Sortable Block Component
function SortableBlock({ 
  block, 
  onUpdate, 
  onDelete, 
  isSelected, 
  onSelect 
}: { 
  block: EmailBlock; 
  onUpdate: (id: string, content: string) => void; 
  onDelete: (id: string) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative border rounded-lg transition-all cursor-pointer',
        isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
      )}
      onClick={() => onSelect(block.id)}
    >
      <div className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" {...attributes} {...listeners}>
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(block.id); }}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      <div className="pl-8 pr-10 py-3">
        {block.type === 'header' && (
          <input
            className="w-full text-xl font-bold bg-transparent border-none outline-none"
            value={block.content}
            onChange={(e) => onUpdate(block.id, e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        )}
        {block.type === 'text' && (
          <textarea
            className="w-full bg-transparent border-none outline-none resize-none text-sm min-h-[60px]"
            value={block.content}
            onChange={(e) => onUpdate(block.id, e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        )}
        {block.type === 'image' && (
          <div className="space-y-2">
            <div className="bg-muted rounded-lg h-32 flex items-center justify-center">
              <Image className="h-8 w-8 text-muted-foreground" />
            </div>
            <input
              className="w-full text-xs bg-transparent border-none outline-none text-muted-foreground"
              value={block.content}
              onChange={(e) => onUpdate(block.id, e.target.value)}
              placeholder="URL de la imagen"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
        {block.type === 'button' && (
          <div className="text-center py-2">
            <span className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
              {block.content}
            </span>
            <input
              className="w-full text-xs bg-transparent border-none outline-none text-center mt-2 text-muted-foreground"
              value={block.content}
              onChange={(e) => onUpdate(block.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
        {block.type === 'divider' && (
          <hr className="border-border my-2" />
        )}
        {block.type === 'spacer' && (
          <div className="h-8 flex items-center justify-center text-xs text-muted-foreground">
            — Espaciador —
          </div>
        )}
      </div>
    </div>
  );
}

export default function EmailTemplatesPage() {
  const { templates: docTemplates } = useDocuments();
  const { toast } = useToast();
  
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([
    {
      id: 'email-1',
      name: 'Notificación de Firma Pendiente',
      subject: 'Tiene un documento pendiente de firma',
      associatedTemplateId: 'tmpl-1',
      blocks: [
        { id: 'b1', type: 'header', content: 'Documento pendiente de firma' },
        { id: 'b2', type: 'text', content: 'Hola {{nombre}}, tiene un documento pendiente de firma. Por favor revise y firme el documento a la brevedad.' },
        { id: 'b3', type: 'divider', content: '' },
        { id: 'b4', type: 'button', content: 'Firmar Documento' },
        { id: 'b5', type: 'spacer', content: '' },
        { id: 'b6', type: 'text', content: 'Si tiene alguna duda, no dude en contactarnos.' },
      ],
      createdAt: new Date(Date.now() - 86400000 * 10),
    },
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<EmailTemplate | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [showVariableHelper, setShowVariableHelper] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id || !currentTemplate) return;

    const oldIndex = currentTemplate.blocks.findIndex(b => b.id === active.id);
    const newIndex = currentTemplate.blocks.findIndex(b => b.id === over.id);

    setCurrentTemplate({
      ...currentTemplate,
      blocks: arrayMove(currentTemplate.blocks, oldIndex, newIndex),
    });
  };

  const addBlock = (type: BlockType) => {
    if (!currentTemplate) return;
    const newBlock: EmailBlock = {
      id: `block-${Date.now()}`,
      type,
      content: getDefaultContent(type),
    };
    setCurrentTemplate({
      ...currentTemplate,
      blocks: [...currentTemplate.blocks, newBlock],
    });
  };

  const updateBlock = (id: string, content: string) => {
    if (!currentTemplate) return;
    setCurrentTemplate({
      ...currentTemplate,
      blocks: currentTemplate.blocks.map(b => b.id === id ? { ...b, content } : b),
    });
  };

  const deleteBlock = (id: string) => {
    if (!currentTemplate) return;
    setCurrentTemplate({
      ...currentTemplate,
      blocks: currentTemplate.blocks.filter(b => b.id !== id),
    });
    if (selectedBlockId === id) setSelectedBlockId(null);
  };

  const createNewTemplate = () => {
    const newTemplate: EmailTemplate = {
      id: `email-${Date.now()}`,
      name: 'Nueva Plantilla de Correo',
      subject: '',
      blocks: [
        { id: `block-${Date.now()}-1`, type: 'header', content: 'Título del correo' },
        { id: `block-${Date.now()}-2`, type: 'text', content: 'Contenido del correo...' },
      ],
      createdAt: new Date(),
    };
    setCurrentTemplate(newTemplate);
    setIsEditing(true);
  };

  const editTemplate = (template: EmailTemplate) => {
    setCurrentTemplate({ ...template });
    setIsEditing(true);
    setPreviewMode(false);
  };

  const saveTemplate = () => {
    if (!currentTemplate) return;
    setEmailTemplates(prev => {
      const exists = prev.find(t => t.id === currentTemplate.id);
      if (exists) return prev.map(t => t.id === currentTemplate.id ? currentTemplate : t);
      return [...prev, currentTemplate];
    });
    toast({ title: 'Plantilla guardada', description: `"${currentTemplate.name}" ha sido guardada correctamente` });
    setIsEditing(false);
    setCurrentTemplate(null);
  };

  const deleteTemplate = (id: string) => {
    setEmailTemplates(prev => prev.filter(t => t.id !== id));
    toast({ title: 'Plantilla eliminada' });
  };

  // Get variables from associated document template
  const getAssociatedVariables = (): string[] => {
    if (!currentTemplate?.associatedTemplateId) return [];
    const docTemplate = docTemplates.find(t => t.id === currentTemplate.associatedTemplateId);
    if (!docTemplate) return [];
    return docTemplate.variables.map(v => v.key);
  };

  const signerVariables = ['firmante_nombre', 'firmante_email', 'firmante_rut', 'documento_titulo', 'fecha_envio', 'enlace_firma'];

  if (isEditing && currentTemplate) {
    const associatedVars = getAssociatedVariables();

    return (
      <div className="h-[calc(100vh-6rem)] flex flex-col animate-fade-in">
        {/* Editor Header */}
        <div className="flex items-center justify-between pb-4 border-b mb-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => { setIsEditing(false); setCurrentTemplate(null); }}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <Input
                value={currentTemplate.name}
                onChange={(e) => setCurrentTemplate({ ...currentTemplate, name: e.target.value })}
                className="text-lg font-semibold border-none shadow-none px-0 h-auto focus-visible:ring-0"
                placeholder="Nombre de la plantilla"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)}>
              {previewMode ? <Edit3 className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {previewMode ? 'Editar' : 'Vista Previa'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowVariableHelper(true)}>
              <Variable className="h-4 w-4 mr-2" />
              Variables
            </Button>
            <Button onClick={saveTemplate} className="bg-gradient-primary hover:opacity-90">
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </Button>
          </div>
        </div>

        <div className="flex-1 flex gap-4 min-h-0">
          {/* Left Sidebar - Block Palette */}
          {!previewMode && (
            <div className="w-48 shrink-0 space-y-3">
              <div className="bg-card border rounded-xl p-3">
                <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-3">Bloques</h4>
                <div className="space-y-1.5">
                  {blockTypes.map(({ type, icon: Icon, label }) => (
                    <button
                      key={type}
                      onClick={() => addBlock(type)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors text-left"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-card border rounded-xl p-3">
                <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-3">Configuración</h4>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Asunto</Label>
                    <Input
                      value={currentTemplate.subject}
                      onChange={(e) => setCurrentTemplate({ ...currentTemplate, subject: e.target.value })}
                      placeholder="Asunto del correo"
                      className="text-xs h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Plantilla Asociada</Label>
                    <Select
                      value={currentTemplate.associatedTemplateId || ''}
                      onValueChange={(v) => setCurrentTemplate({ ...currentTemplate, associatedTemplateId: v || undefined })}
                    >
                      <SelectTrigger className="text-xs h-8">
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {docTemplates.map(t => (
                          <SelectItem key={t.id} value={t.id} className="text-xs">{t.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Canvas */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-[640px] mx-auto">
              {previewMode ? (
                /* Preview Mode */
                <div className="bg-white rounded-xl border shadow-lg overflow-hidden">
                  <div className="bg-muted/50 px-6 py-3 border-b">
                    <p className="text-xs text-muted-foreground">Asunto: <strong>{currentTemplate.subject || '(sin asunto)'}</strong></p>
                  </div>
                  <div className="p-8 space-y-4">
                    {currentTemplate.blocks.map(block => (
                      <div key={block.id}>
                        {block.type === 'header' && <h1 className="text-2xl font-bold text-foreground">{block.content}</h1>}
                        {block.type === 'text' && <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{block.content}</p>}
                        {block.type === 'image' && (
                          <div className="bg-muted rounded-lg h-40 flex items-center justify-center">
                            <Image className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        {block.type === 'button' && (
                          <div className="text-center">
                            <span className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium">{block.content}</span>
                          </div>
                        )}
                        {block.type === 'divider' && <hr className="border-border" />}
                        {block.type === 'spacer' && <div className="h-6" />}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Editor Mode */
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                  <SortableContext items={currentTemplate.blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {currentTemplate.blocks.map(block => (
                        <SortableBlock
                          key={block.id}
                          block={block}
                          onUpdate={updateBlock}
                          onDelete={deleteBlock}
                          isSelected={selectedBlockId === block.id}
                          onSelect={setSelectedBlockId}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}

              {!previewMode && currentTemplate.blocks.length === 0 && (
                <div className="text-center py-16 border-2 border-dashed rounded-xl">
                  <LayoutTemplate className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Agrega bloques desde el panel izquierdo</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Variable Helper Dialog */}
        <Dialog open={showVariableHelper} onOpenChange={setShowVariableHelper}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Variables Disponibles</DialogTitle>
              <DialogDescription>Usa estas variables en el contenido del correo con la sintaxis {"{{variable}}"}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Variables del Firmante</h4>
                <div className="space-y-1">
                  {signerVariables.map(v => (
                    <div key={v} className="flex items-center gap-2 text-sm">
                      <code className="px-2 py-0.5 bg-muted rounded text-xs font-mono">{`{{${v}}}`}</code>
                      <span className="text-muted-foreground text-xs">{v.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
              {associatedVars.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Variables de la Plantilla de Documento</h4>
                  <div className="space-y-1">
                    {associatedVars.map(v => (
                      <div key={v} className="flex items-center gap-2 text-sm">
                        <code className="px-2 py-0.5 bg-muted rounded text-xs font-mono">{`{{${v}}}`}</code>
                        <span className="text-muted-foreground text-xs">{v.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Plantillas de Correo</h1>
          <p className="text-muted-foreground">Diseña plantillas de correo reutilizables con drag & drop</p>
        </div>
        <Button onClick={createNewTemplate} className="bg-gradient-primary hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Plantilla
        </Button>
      </div>

      {emailTemplates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <Mail className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sin plantillas de correo</h3>
            <p className="text-muted-foreground mb-4">Crea tu primera plantilla de correo para enviar notificaciones personalizadas</p>
            <Button onClick={createNewTemplate}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Plantilla
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {emailTemplates.map(template => {
            const associatedDoc = docTemplates.find(t => t.id === template.associatedTemplateId);
            return (
              <Card key={template.id} className="card-interactive cursor-pointer" onClick={() => editTemplate(template)}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-sm">{template.name}</CardTitle>
                        <CardDescription className="text-xs">{template.blocks.length} bloques</CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={(e) => { e.stopPropagation(); deleteTemplate(template.id); }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {template.subject && (
                    <p className="text-xs text-muted-foreground truncate">
                      Asunto: {template.subject}
                    </p>
                  )}
                  {associatedDoc && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Link2 className="h-3 w-3" />
                      <span>Asociada a: {associatedDoc.title}</span>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Creada: {template.createdAt.toLocaleDateString('es-CL')}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
