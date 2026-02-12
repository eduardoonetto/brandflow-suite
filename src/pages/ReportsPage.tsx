import React, { useState } from 'react';
import { useInstitution } from '@/context/InstitutionContext';
import { useDocuments } from '@/context/DocumentContext';
import { ReportJob, Document } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Download, FileSpreadsheet, Filter, Search, Clock, CheckCircle, Loader2, Play, Trash2, BarChart3, XCircle, AlertTriangle
} from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

type ReportType = 'all' | 'emails' | 'signatures' | 'tags';

const mockReportJobs: ReportJob[] = [
  { id: 'job-1', name: 'Reporte Mensual Enero 2025', status: 'completed', progress: 100, totalRecords: 156, processedRecords: 156, downloadUrl: '#', createdAt: new Date(Date.now() - 86400000 * 2), completedAt: new Date(Date.now() - 86400000 * 2 + 60000) },
  { id: 'job-2', name: 'Documentos Firmados Q4 2024', status: 'processing', progress: 67, totalRecords: 89, processedRecords: 60, createdAt: new Date(Date.now() - 3600000) },
  { id: 'job-3', name: 'Análisis por Departamento', status: 'pending', progress: 0, createdAt: new Date() },
];

const reportTypeLabels: Record<ReportType, string> = {
  all: 'Todos los Reportes',
  emails: 'Reporte de Correos',
  signatures: 'Reporte de Estado de Firma',
  tags: 'Reporte por TAG',
};

export default function ReportsPage() {
  const { currentInstitution } = useInstitution();
  const { documents, tags } = useDocuments();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('generate');
  const [reportJobs, setReportJobs] = useState<ReportJob[]>(mockReportJobs);
  
  const [reportType, setReportType] = useState<ReportType>('all');
  const [filters, setFilters] = useState({
    status: 'all',
    tag: 'all',
    dateFrom: '',
    dateTo: '',
    search: '',
  });
  
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [dateError, setDateError] = useState('');

  // Validate date range (max 30 days)
  const validateDateRange = (from: string, to: string) => {
    if (from && to) {
      const diff = differenceInDays(parseISO(to), parseISO(from));
      if (diff > 30) {
        setDateError('El rango máximo es de 30 días');
        return false;
      }
      if (diff < 0) {
        setDateError('La fecha "Hasta" debe ser posterior a "Desde"');
        return false;
      }
    }
    setDateError('');
    return true;
  };

  const handleDateChange = (field: 'dateFrom' | 'dateTo', value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    validateDateRange(newFilters.dateFrom, newFilters.dateTo);
  };

  const filteredDocuments = documents.filter(doc => {
    if (filters.status !== 'all' && doc.status !== filters.status) return false;
    if (filters.tag !== 'all' && !doc.tags.some(t => t.id === filters.tag)) return false;
    if (filters.search && !doc.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.dateFrom && new Date(doc.createdAt) < parseISO(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(doc.createdAt) > parseISO(filters.dateTo)) return false;
    return true;
  });

  const handleExport = () => {
    if (dateError) {
      toast({ title: 'Error de validación', description: dateError, variant: 'destructive' });
      return;
    }
    if (!filters.dateFrom || !filters.dateTo) {
      toast({ title: 'Fechas requeridas', description: 'Debe ingresar fecha Desde y Hasta', variant: 'destructive' });
      return;
    }

    const reportName = `${reportTypeLabels[reportType]} - ${format(new Date(), 'd MMM yyyy HH:mm', { locale: es })}`;
    const newJob: ReportJob = {
      id: `job-${Date.now()}`,
      name: reportName,
      status: 'pending',
      progress: 0,
      totalRecords: selectedDocs.length || filteredDocuments.length,
      createdAt: new Date(),
    };
    setReportJobs(prev => [newJob, ...prev]);
    setActiveTab('jobs');
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress >= 100) {
        clearInterval(interval);
        setReportJobs(prev => prev.map(job => 
          job.id === newJob.id 
            ? { ...job, status: 'completed', progress: 100, completedAt: new Date(), processedRecords: job.totalRecords }
            : job
        ));
      } else {
        setReportJobs(prev => prev.map(job => 
          job.id === newJob.id 
            ? { ...job, status: 'processing', progress, processedRecords: Math.floor((progress / 100) * (job.totalRecords || 0)) }
            : job
        ));
      }
    }, 500);
  };

  const getStatusBadge = (status: ReportJob['status']) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>;
      case 'processing': return <Badge className="bg-blue-500/15 text-blue-500 border-0"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Procesando</Badge>;
      case 'completed': return <Badge className="bg-success/15 text-success border-0"><CheckCircle className="h-3 w-3 mr-1" />Completado</Badge>;
      case 'failed': return <Badge className="bg-destructive/15 text-destructive border-0"><XCircle className="h-3 w-3 mr-1" />Error</Badge>;
    }
  };

  const toggleDocSelection = (docId: string) => {
    setSelectedDocs(prev => prev.includes(docId) ? prev.filter(d => d !== docId) : [...prev, docId]);
  };

  const toggleAllDocs = () => {
    if (selectedDocs.length === filteredDocuments.length) {
      setSelectedDocs([]);
    } else {
      setSelectedDocs(filteredDocuments.map(d => d.id));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Reportería</h1>
          <p className="text-muted-foreground">Genera y exporta reportes de documentos</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="generate" className="gap-2">
            <BarChart3 className="h-4 w-4" />Generar Reporte
          </TabsTrigger>
          <TabsTrigger value="jobs" className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />Reportes en Proceso
            {reportJobs.filter(j => j.status === 'processing' || j.status === 'pending').length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {reportJobs.filter(j => j.status === 'processing' || j.status === 'pending').length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          {/* Report Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5" />Tipo de Reporte</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {(Object.entries(reportTypeLabels) as [ReportType, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setReportType(key)}
                    className={`p-3 rounded-lg border-2 text-left transition-all text-sm ${
                      reportType === key ? 'border-primary bg-primary/5 font-medium' : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
              <CardDescription>Filtra los documentos que deseas incluir en el reporte</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label>Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Título..." value={filters.search} onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))} className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select value={filters.status} onValueChange={(v) => setFilters(prev => ({ ...prev, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="draft">Borrador</SelectItem>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="signed">Firmado</SelectItem>
                      <SelectItem value="rejected">Rechazado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Etiqueta</Label>
                  <Select value={filters.tag} onValueChange={(v) => setFilters(prev => ({ ...prev, tag: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {tags.map(tag => (
                        <SelectItem key={tag.id} value={tag.id}>{tag.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Desde *</Label>
                  <Input type="date" value={filters.dateFrom} onChange={(e) => handleDateChange('dateFrom', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Hasta *</Label>
                  <Input type="date" value={filters.dateTo} onChange={(e) => handleDateChange('dateTo', e.target.value)} />
                </div>
              </div>
              {dateError && (
                <div className="mt-3 flex items-center gap-2 text-sm text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  {dateError}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Documentos</CardTitle>
                <CardDescription>
                  {selectedDocs.length > 0 ? `${selectedDocs.length} de ${filteredDocuments.length} seleccionados` : `${filteredDocuments.length} documentos encontrados`}
                </CardDescription>
              </div>
              <Button onClick={handleExport} className="bg-gradient-primary hover:opacity-90" disabled={filteredDocuments.length === 0 || !!dateError}>
                <Download className="h-4 w-4 mr-2" />
                Exportar {selectedDocs.length > 0 ? `(${selectedDocs.length})` : 'Todos'}
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox checked={selectedDocs.length === filteredDocuments.length && filteredDocuments.length > 0} onCheckedChange={toggleAllDocs} />
                    </TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Etiquetas</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.slice(0, 10).map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell><Checkbox checked={selectedDocs.includes(doc.id)} onCheckedChange={() => toggleDocSelection(doc.id)} /></TableCell>
                      <TableCell className="font-medium">{doc.title}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {doc.status === 'draft' ? 'Borrador' : doc.status === 'pending' ? 'Pendiente' : doc.status === 'signed' ? 'Firmado' : 'Rechazado'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {doc.tags.slice(0, 2).map(tag => (
                            <Badge key={tag.id} variant="secondary" className="text-xs" style={{ backgroundColor: `hsl(${tag.color} / 0.15)`, color: `hsl(${tag.color})` }}>
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{format(doc.createdAt, 'd MMM yyyy', { locale: es })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Reportes</CardTitle>
              <CardDescription>Visualiza y descarga tus reportes generados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {reportJobs.map((job) => (
                <div key={job.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{job.name}</p>
                        <p className="text-sm text-muted-foreground">{format(job.createdAt, 'd MMM yyyy HH:mm', { locale: es })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(job.status)}
                      {job.status === 'completed' && (
                        <Button size="sm" variant="outline"><Download className="h-4 w-4 mr-2" />Descargar</Button>
                      )}
                      {job.status === 'failed' && (
                        <Button size="sm" variant="outline"><Play className="h-4 w-4 mr-2" />Reintentar</Button>
                      )}
                    </div>
                  </div>
                  {(job.status === 'processing' || job.status === 'pending') && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{job.processedRecords || 0} de {job.totalRecords || '?'} registros</span>
                        <span>{job.progress}%</span>
                      </div>
                      <Progress value={job.progress} />
                    </div>
                  )}
                  {job.status === 'completed' && (
                    <p className="text-sm text-muted-foreground">
                      {job.processedRecords} registros procesados en {job.completedAt && Math.round((job.completedAt.getTime() - job.createdAt.getTime()) / 1000)}s
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
