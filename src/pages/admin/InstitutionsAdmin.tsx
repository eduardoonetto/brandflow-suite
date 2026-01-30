import React, { useState, useEffect } from 'react';
import { institutionService } from '@/services/api';
import { Institution } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Building2, 
  Palette, 
  Globe, 
  Key,
  Edit3,
  Trash2,
  Upload,
  Check,
  Loader2
} from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import { cn } from '@/lib/utils';

const colorPresets = [
  { name: 'Azul', value: '220 80% 45%' },
  { name: 'Teal', value: '175 65% 42%' },
  { name: 'Púrpura', value: '280 70% 50%' },
  { name: 'Verde', value: '142 71% 45%' },
  { name: 'Rojo', value: '0 84% 60%' },
  { name: 'Naranja', value: '25 95% 53%' },
];

export default function InstitutionsAdmin() {
  const { setTheme } = useTheme();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    taxId: '',
    apiKey: '',
    allowedDomain: '',
    primaryColor: '220 80% 45%',
    logoUrl: '',
  });

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    setIsLoading(true);
    try {
      const response = await institutionService.getAll();
      setInstitutions(response.data);
    } catch (error) {
      console.error('Failed to fetch institutions:', error);
    }
    setIsLoading(false);
  };

  const handleOpenDialog = (institution?: Institution) => {
    if (institution) {
      setEditingInstitution(institution);
      setFormData({
        name: institution.name,
        taxId: institution.taxId,
        apiKey: institution.apiKey,
        allowedDomain: institution.allowedDomain,
        primaryColor: institution.primaryColor,
        logoUrl: institution.logoUrl,
      });
    } else {
      setEditingInstitution(null);
      setFormData({
        name: '',
        taxId: '',
        apiKey: `ak_${Math.random().toString(36).substring(7)}`,
        allowedDomain: '',
        primaryColor: '220 80% 45%',
        logoUrl: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (editingInstitution) {
        await institutionService.update(editingInstitution.id, formData);
      } else {
        await institutionService.create(formData as any);
      }
      await fetchInstitutions();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to save institution:', error);
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta institución?')) return;
    
    try {
      await institutionService.delete(id);
      await fetchInstitutions();
    } catch (error) {
      console.error('Failed to delete institution:', error);
    }
  };

  const handlePreviewTheme = (color: string) => {
    setFormData(prev => ({ ...prev, primaryColor: color }));
    setTheme({ primaryColor: color });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Instituciones</h1>
          <p className="text-muted-foreground">
            Administre las empresas cliente y su configuración de branding
          </p>
        </div>
        
        <Button 
          onClick={() => handleOpenDialog()}
          className="bg-gradient-primary hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Institución
        </Button>
      </div>

      {/* Institutions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Instituciones Registradas</CardTitle>
          <CardDescription>
            Lista de todas las empresas configuradas en la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Institución</TableHead>
                <TableHead>ID Tributario</TableHead>
                <TableHead>Dominio</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {institutions.map((institution) => (
                <TableRow key={institution.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div 
                        className="h-10 w-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `hsl(${institution.primaryColor} / 0.15)` }}
                      >
                        <Building2 
                          className="h-5 w-5" 
                          style={{ color: `hsl(${institution.primaryColor})` }}
                        />
                      </div>
                      <div>
                        <p className="font-medium">{institution.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {institution.apiKey.substring(0, 12)}...
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {institution.taxId}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm">{institution.allowedDomain}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div 
                      className="h-6 w-12 rounded-md border"
                      style={{ backgroundColor: `hsl(${institution.primaryColor})` }}
                    />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(institution.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(institution)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(institution.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingInstitution ? 'Editar Institución' : 'Nueva Institución'}
            </DialogTitle>
            <DialogDescription>
              Configure los datos de la empresa y su branding personalizado
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Razón Social</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nombre de la empresa"
                />
              </div>
              <div className="space-y-2">
                <Label>ID Tributario</Label>
                <Input
                  value={formData.taxId}
                  onChange={(e) => setFormData(prev => ({ ...prev, taxId: e.target.value }))}
                  placeholder="12-3456789"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Dominio Permitido</Label>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <Input
                  value={formData.allowedDomain}
                  onChange={(e) => setFormData(prev => ({ ...prev, allowedDomain: e.target.value }))}
                  placeholder="empresa.signflow.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>API Key</Label>
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-muted-foreground" />
                <Input
                  value={formData.apiKey}
                  readOnly
                  className="font-mono text-sm bg-muted"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Color Principal
              </Label>
              <div className="flex flex-wrap gap-2">
                {colorPresets.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handlePreviewTheme(color.value)}
                    className={cn(
                      'h-10 w-10 rounded-lg border-2 transition-all',
                      formData.primaryColor === color.value 
                        ? 'border-foreground scale-110' 
                        : 'border-transparent hover:scale-105'
                    )}
                    style={{ backgroundColor: `hsl(${color.value})` }}
                    title={color.name}
                  >
                    {formData.primaryColor === color.value && (
                      <Check className="h-5 w-5 mx-auto text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Logo de Empresa</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Arrastre o haga clic para subir
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG o SVG (max. 2MB)
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isSaving || !formData.name || !formData.taxId}
              className="bg-gradient-primary"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {editingInstitution ? 'Guardar Cambios' : 'Crear Institución'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
