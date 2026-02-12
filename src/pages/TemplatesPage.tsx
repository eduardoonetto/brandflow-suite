import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocuments } from '@/context/DocumentContext';
import { useInstitution } from '@/context/InstitutionContext';
import { CreateDocumentModal } from '@/components/documents/CreateDocumentModal';
import { DocumentTemplate } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, Search, FileText, MoreVertical, Edit, Copy, Trash2, Eye, Send, Download
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

export default function TemplatesPage() {
  const navigate = useNavigate();
  const { templates, deleteTemplate } = useDocuments();
  const { isPersonalInstitution } = useInstitution();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (isPersonalInstitution) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold mb-1">Plantillas no disponibles</h3>
        <p className="text-muted-foreground text-sm max-w-md px-4">
          Solo las instituciones organizacionales pueden crear y gestionar plantillas.
        </p>
      </div>
    );
  }

  const filteredTemplates = templates.filter(tmpl => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      tmpl.title.toLowerCase().includes(query) ||
      tmpl.description.toLowerCase().includes(query) ||
      tmpl.category.toLowerCase().includes(query)
    );
  });

  const groupedTemplates = filteredTemplates.reduce((acc, tmpl) => {
    const category = tmpl.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(tmpl);
    return acc;
  }, {} as Record<string, DocumentTemplate[]>);

  const handleSendToSign = (template: DocumentTemplate) => {
    // Navigate to editor to fill variables and configure signers
    navigate(`/documents/new?templateId=${template.id}`);
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('¿Está seguro de eliminar esta plantilla?')) {
      deleteTemplate(id);
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Título', 'Descripción', 'Tipo', 'Categoría', 'Variables', 'Tags', 'Contenido', 'Fecha Creación', 'Fecha Actualización'];
    const rows = templates.map(t => [
      t.id,
      t.title,
      t.description,
      t.templateType,
      t.category,
      t.variables.map(v => `${v.key}:${v.type}:${v.label}:${v.required}`).join('|'),
      t.tags.map(tag => `${tag.name}:${tag.color}`).join('|'),
      t.content.replace(/"/g, '""'),
      format(t.createdAt, 'yyyy-MM-dd HH:mm:ss'),
      format(t.updatedAt, 'yyyy-MM-dd HH:mm:ss'),
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `plantillas_export_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({ title: 'Exportación completada', description: `${templates.length} plantillas exportadas a CSV` });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Plantillas de Documentos</h1>
          <p className="text-muted-foreground">
            Crea y administra plantillas reutilizables para tus documentos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-primary hover:opacity-90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Plantilla
          </Button>
        </div>
      </div>

      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar plantillas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {Object.keys(groupedTemplates).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-1">No hay plantillas</h3>
          <p className="text-muted-foreground text-sm mb-4">Crea tu primera plantilla para empezar</p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Crear Plantilla
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
            <div key={category}>
              <h2 className="text-lg font-semibold mb-4">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryTemplates.map((template) => (
                  <Card key={template.id} className="group hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <CardTitle className="text-base truncate">{template.title}</CardTitle>
                            <CardDescription className="line-clamp-2">{template.description}</CardDescription>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/templates/${template.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />Ver
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/templates/${template.id}/edit`)}>
                              <Edit className="h-4 w-4 mr-2" />Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteTemplate(template.id)} className="text-destructive focus:text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-1">
                        {template.tags.map(tag => (
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
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{template.variables.length} variables</span>
                        <span>{format(template.updatedAt, 'd MMM yyyy', { locale: es })}</span>
                      </div>
                      <Button 
                        className="w-full bg-gradient-primary hover:opacity-90"
                        onClick={() => handleSendToSign(template)}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Enviar a Firmar
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateDocumentModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal}
        mode="template"
      />
    </div>
  );
}
