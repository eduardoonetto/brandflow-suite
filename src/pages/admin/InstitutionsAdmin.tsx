import React, { useState, useEffect, useRef } from 'react';
import { institutionService } from '@/services/api';
import { Institution } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { generateApiKey, maskApiKey } from '@/utils/apiKeyGenerator';
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
  Key,
  Edit3,
  Trash2,
  Upload,
  Loader2,
  RefreshCw,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { TableSkeleton } from '@/components/ui/loading-overlay';
import codelcoLogo from '@/assets/codelco-logo.png';
import falabellaLogo from '@/assets/falabella-logo.png';

// HSL <-> Hex conversion utilities
function hslToHex(hslStr: string): string {
  const parts = hslStr.replace(/%/g, '').split(' ');
  const h = parseFloat(parts[0]) || 0;
  const s = (parseFloat(parts[1]) || 0) / 100;
  const l = (parseFloat(parts[2]) || 0) / 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
      case g: h = ((b - r) / d + 2) * 60; break;
      case b: h = ((r - g) / d + 4) * 60; break;
    }
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

// Institution logo mapping
const institutionLogoMap: Record<string, string> = {
  'inst-acme': codelcoLogo,
  'inst-tech': falabellaLogo,
};

export default function InstitutionsAdmin() {
  const { setTheme } = useTheme();
  const { toast } = useToast();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [hexColor, setHexColor] = useState('#1a6dcc');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    taxId: '',
    apiKey: '',
    primaryColor: '220 80% 45%',
    logoUrl: '',
  });

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const response = await institutionService.getAll();
      // Enrich with logos
      const enriched = response.data.map(inst => ({
        ...inst,
        logoUrl: inst.logoUrl || institutionLogoMap[inst.id] || '',
      }));
      setInstitutions(enriched);
    } catch (error) {
      console.error('Failed to fetch institutions:', error);
    }
    setIsLoading(false);
  };

  const handleOpenDialog = (institution?: Institution) => {
    if (institution) {
      setEditingInstitution(institution);
      const color = institution.primaryColor;
      setFormData({
        name: institution.name,
        taxId: institution.taxId || '',
        apiKey: institution.apiKey || '',
        primaryColor: color,
        logoUrl: institution.logoUrl,
      });
      setHexColor(hslToHex(color));
    } else {
      setEditingInstitution(null);
      setFormData({
        name: '',
        taxId: '',
        apiKey: generateApiKey(),
        primaryColor: '220 80% 45%',
        logoUrl: '',
      });
      setHexColor('#1a6dcc');
    }
    setShowApiKey(false);
    setIsDialogOpen(true);
  };

  const handleGenerateNewApiKey = () => {
    const newKey = generateApiKey();
    setFormData(prev => ({ ...prev, apiKey: newKey }));
    toast({ title: 'API Key generada', description: 'Se ha generado una nueva API Key' });
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(formData.apiKey);
    toast({ title: 'Copiado', description: 'API Key copiada al portapapeles' });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: 'Archivo muy grande', description: 'El logo no debe superar 2MB', variant: 'destructive' });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, logoUrl: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleColorPickerChange = (hex: string) => {
    setHexColor(hex);
    const hsl = hexToHsl(hex);
    setFormData(prev => ({ ...prev, primaryColor: hsl }));
    setTheme({ primaryColor: hsl });
  };

  const handleHexInputChange = (value: string) => {
    setHexColor(value);
    if (/^#[0-9a-fA-F]{6}$/.test(value)) {
      const hsl = hexToHsl(value);
      setFormData(prev => ({ ...prev, primaryColor: hsl }));
      setTheme({ primaryColor: hsl });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      if (editingInstitution) {
        await institutionService.update(editingInstitution.id, formData);
      } else {
        await institutionService.create(formData as any);
      }
      await fetchInstitutions();
      setIsDialogOpen(false);
      toast({
        title: editingInstitution ? 'Institución actualizada' : 'Institución creada',
        description: `${formData.name} ha sido ${editingInstitution ? 'actualizada' : 'creada'} correctamente`,
      });
    } catch (error) {
      console.error('Failed to save institution:', error);
      toast({ title: 'Error', description: 'No se pudo guardar la institución', variant: 'destructive' });
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta institución?')) return;
    try {
      await institutionService.delete(id);
      await fetchInstitutions();
      toast({ title: 'Institución eliminada', description: 'La institución ha sido eliminada correctamente' });
    } catch (error) {
      console.error('Failed to delete institution:', error);
    }
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
        <Button onClick={() => handleOpenDialog()} className="bg-gradient-primary hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Institución
        </Button>
      </div>

      {/* Institutions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Instituciones Registradas</CardTitle>
          <CardDescription>Lista de todas las empresas configuradas en la plataforma</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <TableSkeleton rows={4} cols={5} />
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Institución</TableHead>
                <TableHead className="hidden md:table-cell">ID Tributario</TableHead>
                <TableHead className="hidden sm:table-cell">Color</TableHead>
                <TableHead className="hidden lg:table-cell">Creado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {institutions.map((institution) => (
                <TableRow key={institution.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div 
                        className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 bg-muted"
                      >
                        {institution.logoUrl ? (
                          <img 
                            src={institution.logoUrl} 
                            alt={institution.name}
                            className="h-8 w-8 object-contain rounded"
                          />
                        ) : (
                          <Building2 
                            className="h-5 w-5" 
                            style={{ color: `hsl(${institution.primaryColor})` }}
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{institution.name}</p>
                        <p className="text-xs text-muted-foreground font-mono hidden sm:block">
                          {maskApiKey(institution.apiKey || '')}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm hidden md:table-cell">
                    {institution.taxId}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-6 w-12 rounded-md border"
                        style={{ backgroundColor: `hsl(${institution.primaryColor})` }}
                      />
                      <span className="text-xs text-muted-foreground font-mono">{hslToHex(institution.primaryColor)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                    {formatDate(institution.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(institution)}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(institution.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingInstitution ? 'Editar Institución' : 'Nueva Institución'}</DialogTitle>
            <DialogDescription>Configure los datos de la empresa y su branding personalizado</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  placeholder="76.196.080-4"
                />
              </div>
            </div>

            {/* API Key with generator */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                API Key
              </Label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    value={showApiKey ? formData.apiKey : maskApiKey(formData.apiKey)}
                    readOnly
                    className="font-mono text-sm bg-muted pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button type="button" variant="outline" size="icon" onClick={handleCopyApiKey} title="Copiar">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button type="button" variant="outline" size="icon" onClick={handleGenerateNewApiKey} title="Generar nueva">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Use esta API Key para integrar con sistemas externos</p>
            </div>

            {/* Color Picker */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Color Principal
              </Label>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="color"
                    value={hexColor}
                    onChange={(e) => handleColorPickerChange(e.target.value)}
                    className="w-12 h-12 rounded-lg border-2 border-border cursor-pointer p-0.5"
                    style={{ backgroundColor: 'transparent' }}
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground w-8">HEX</Label>
                    <Input
                      value={hexColor}
                      onChange={(e) => handleHexInputChange(e.target.value)}
                      placeholder="#000000"
                      className="font-mono text-sm h-9"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground w-8">HSL</Label>
                    <Input
                      value={formData.primaryColor}
                      readOnly
                      className="font-mono text-sm h-9 bg-muted text-muted-foreground"
                    />
                  </div>
                </div>
              </div>
              <div 
                className="h-8 rounded-lg border mt-2"
                style={{ backgroundColor: `hsl(${formData.primaryColor})` }}
              />
            </div>

            {/* Logo */}
            <div className="space-y-2">
              <Label>Logo de Empresa</Label>
              <input
                type="file"
                ref={logoInputRef}
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
              <div 
                onClick={() => logoInputRef.current?.click()}
                className={cn(
                  'border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer',
                  formData.logoUrl && 'border-success bg-success/5'
                )}
              >
                {formData.logoUrl ? (
                  <div className="flex flex-col items-center gap-2">
                    <img 
                      src={formData.logoUrl} 
                      alt="Logo preview" 
                      className="h-16 w-auto object-contain"
                    />
                    <p className="text-sm text-success">Logo cargado</p>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Arrastre o haga clic para subir</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG o SVG (max. 2MB)</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button 
              onClick={handleSave}
              disabled={isSaving || !formData.name || !formData.taxId}
              className="bg-gradient-primary"
            >
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {editingInstitution ? 'Guardar Cambios' : 'Crear Institución'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
