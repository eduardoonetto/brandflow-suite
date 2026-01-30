import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocuments } from '@/context/DocumentContext';
import { DocumentCard } from '@/components/documents/DocumentCard';
import { FilterSidebar } from '@/components/documents/FilterSidebar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Download, 
  Grid, 
  List,
  FileText,
  Trash2,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Documents() {
  const navigate = useNavigate();
  const { 
    filteredDocuments, 
    selectedDocuments, 
    toggleDocumentSelection,
    selectAllDocuments,
    clearSelection,
    deleteDocument
  } = useDocuments();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isExporting, setIsExporting] = useState(false);

  const hasSelection = selectedDocuments.length > 0;
  const allSelected = selectedDocuments.length === filteredDocuments.length && filteredDocuments.length > 0;

  const handleExportZip = async () => {
    setIsExporting(true);
    // Simulate export
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsExporting(false);
    // In real app, trigger download
    alert('Exportación completada (demo)');
  };

  const handleBulkDelete = () => {
    if (confirm(`¿Está seguro de eliminar ${selectedDocuments.length} documentos?`)) {
      selectedDocuments.forEach(id => deleteDocument(id));
      clearSelection();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Documentos</h1>
          <p className="text-muted-foreground">
            {filteredDocuments.length} documentos encontrados
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center border rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded transition-colors',
                viewMode === 'grid' ? 'bg-muted' : 'hover:bg-muted/50'
              )}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded transition-colors',
                viewMode === 'list' ? 'bg-muted' : 'hover:bg-muted/50'
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          
          <Button 
            onClick={() => navigate('/documents/new')}
            className="bg-gradient-primary hover:opacity-90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Documento
          </Button>
        </div>
      </div>

      {/* Bulk actions bar */}
      {hasSelection && (
        <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg animate-scale-in">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={allSelected}
              onCheckedChange={(checked) => {
                if (checked) selectAllDocuments();
                else clearSelection();
              }}
            />
            <span className="font-medium">
              {selectedDocuments.length} seleccionados
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExportZip}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Exportar ZIP
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleBulkDelete}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={clearSelection}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex gap-6">
        <FilterSidebar />
        
        <div className="flex-1">
          {filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">No hay documentos</h3>
              <p className="text-muted-foreground text-sm mb-4">
                No se encontraron documentos con los filtros actuales
              </p>
              <Button 
                onClick={() => navigate('/documents/new')}
                className="bg-gradient-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear primer documento
              </Button>
            </div>
          ) : (
            <div className={cn(
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 gap-4' 
                : 'space-y-3'
            )}>
              {filteredDocuments.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  selected={selectedDocuments.includes(doc.id)}
                  onSelect={() => toggleDocumentSelection(doc.id)}
                  onEdit={() => navigate(`/documents/${doc.id}/edit`)}
                  onView={() => navigate(`/documents/${doc.id}`)}
                  onSend={() => navigate(`/documents/${doc.id}/send`)}
                  onDelete={() => {
                    if (confirm('¿Está seguro de eliminar este documento?')) {
                      deleteDocument(doc.id);
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
