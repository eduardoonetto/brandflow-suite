import React, { useState } from 'react';
import { useInstitution } from '@/context/InstitutionContext';
import { useDocuments } from '@/context/DocumentContext';
import { ReportJob } from '@/types';
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
import { 
  Download, FileSpreadsheet, Filter, Search, Clock, CheckCircle, Loader2, Play, BarChart3, XCircle, AlertTriangle, Mail, PenLine, Tag
} from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

type ReportType = 'emails' | 'signatures' | 'tags';

const reportTypeLabels: Record<ReportType, { label: string; icon: React.ElementType }> = {
  emails: { label: 'Reporte de Correos', icon: Mail },
  signatures: { label: 'Reporte de Estado de Firma', icon: PenLine },
  tags: { label: 'Reporte por TAG', icon: Tag },
};

// Mock data generators per report type
const mockEmailResults = [
  { id: 1, recipient: 'maria@empresa.cl', subject: 'Documento pendiente de firma', type: 'Pendiente', status: 'Entregado', sentAt: new Date(Date.now() - 86400000), openedAt: new Date(Date.now() - 43200000) },
  { id: 2, recipient: 'pedro@empresa.cl', subject: 'Documento firmado por todos', type: 'Firmado', status: 'Entregado', sentAt: new Date(Date.now() - 172800000), openedAt: new Date(Date.now() - 86400000) },
  { id: 3, recipient: 'ana@empresa.cl', subject: 'Documento rechazado', type: 'Rechazo', status: 'No entregado', sentAt: new Date(Date.now() - 259200000), openedAt: null },
  { id: 4, recipient: 'carlos@empresa.cl', subject: 'Nuevo documento para firmar', type: 'Pendiente', status: 'Entregado', sentAt: new Date(Date.now() - 50000000), openedAt: new Date(Date.now() - 40000000) },
];

const mockSignatureResults = [
  { id: 1, document: 'Contrato de Trabajo #001', signer: 'María López', role: 'RRHH', status: 'Firmado', method: 'PIN', signedAt: new Date(Date.now() - 86400000), ipAddress: '192.168.1.10' },
  { id: 2, document: 'NDA Confidencialidad', signer: 'Pedro Soto', role: 'Legal', status: 'Pendiente', method: '-', signedAt: null, ipAddress: '-' },
  { id: 3, document: 'Contrato de Arriendo', signer: 'Ana Torres', role: 'Gerencia', status: 'Rechazado', method: '-', signedAt: null, ipAddress: '-' },
  { id: 4, document: 'Acta de Reunión #12', signer: 'Carlos Vega', role: 'Trabajador', status: 'Firmado', method: 'Cédula', signedAt: new Date(Date.now() - 172800000), ipAddress: '10.0.0.5' },
];

const mockTagResults = [
  { id: 1, tag: 'Contratos', documents: 24, signed: 18, pending: 4, rejected: 2 },
  { id: 2, tag: 'RRHH', documents: 15, signed: 12, pending: 2, rejected: 1 },
  { id: 3, tag: 'Legal', documents: 8, signed: 6, pending: 1, rejected: 1 },
  { id: 4, tag: 'Finanzas', documents: 11, signed: 9, pending: 2, rejected: 0 },
];

export default function ReportsPage() {
  const { currentInstitution } = useInstitution();
  const { tags } = useDocuments();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('generate');
  const [reportJobs, setReportJobs] = useState<ReportJob[]>([]);
  
  const [reportType, setReportType] = useState<ReportType>('emails');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState({
    emailStatus: 'all',
    selectedTag: 'all',
    dateFrom: '',
    dateTo: '',
  });
  
  const [dateError, setDateError] = useState('');

  const validateDateRange = (from: string, to: string) => {
    if (from && to) {
      const diff = differenceInDays(parseISO(to), parseISO(from));
      if (diff < 0) {
        setDateError('La fecha "Hasta" debe ser posterior a "Desde"');
        return false;
      }
      if (diff > 30) {
        setDateError('El rango máximo es de 30 días');
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

  const handleSearch = async () => {
    if (!filters.dateFrom || !filters.dateTo) {
      toast({ title: 'Fechas requeridas', description: 'Debe ingresar fecha Desde y Hasta', variant: 'destructive' });
      return;
    }
    if (dateError) {
      toast({ title: 'Error de validación', description: dateError, variant: 'destructive' });
      return;
    }
    
    setIsSearching(true);
    setHasSearched(false);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSearching(false);
    setHasSearched(true);
  };

  const handleExport = () => {
    if (!hasSearched) {
      toast({ title: 'Busque primero', description: 'Realice una búsqueda antes de exportar', variant: 'destructive' });
      return;
    }

    const reportName = `${reportTypeLabels[reportType].label} - ${format(new Date(), 'd MMM yyyy HH:mm', { locale: es })}`;
    const newJob: ReportJob = {
      id: `job-${Date.now()}`,
      name: reportName,
      status: 'pending',
      progress: 0,
      totalRecords: reportType === 'emails' ? mockEmailResults.length : reportType === 'signatures' ? mockSignatureResults.length : mockTagResults.length,
      createdAt: new Date(),
    };
    setReportJobs(prev => [newJob, ...prev]);
    setActiveTab('jobs');
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 15;
      if (progress >= 100) {
        clearInterval(interval);
        setReportJobs(prev => prev.map(job => 
          job.id === newJob.id ? { ...job, status: 'completed', progress: 100, completedAt: new Date(), processedRecords: job.totalRecords } : job
        ));
      } else {
        setReportJobs(prev => prev.map(job => 
          job.id === newJob.id ? { ...job, status: 'processing', progress, processedRecords: Math.floor((progress / 100) * (job.totalRecords || 0)) } : job
        ));
      }
    }, 400);
  };

  const getStatusBadge = (status: ReportJob['status']) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>;
      case 'processing': return <Badge className="bg-blue-500/15 text-blue-500 border-0"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Procesando</Badge>;
      case 'completed': return <Badge className="bg-success/15 text-success border-0"><CheckCircle className="h-3 w-3 mr-1" />Completado</Badge>;
      case 'failed': return <Badge className="bg-destructive/15 text-destructive border-0"><XCircle className="h-3 w-3 mr-1" />Error</Badge>;
    }
  };

  const renderResultsTable = () => {
    if (isSearching) {
      return (
        <div className="py-16 text-center space-y-4">
          <Loader2 className="h-10 w-10 mx-auto animate-spin text-primary" />
          <p className="text-muted-foreground">Consultando datos...</p>
        </div>
      );
    }

    if (!hasSearched) {
      return (
        <div className="py-16 text-center space-y-2">
          <Search className="h-10 w-10 mx-auto text-muted-foreground/50" />
          <p className="text-muted-foreground">Configure los filtros y presione "Buscar" para generar el reporte</p>
        </div>
      );
    }

    if (reportType === 'emails') {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Destinatario</TableHead>
              <TableHead>Asunto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Estado Envío</TableHead>
              <TableHead>Fecha Envío</TableHead>
              <TableHead>Fecha Apertura</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockEmailResults.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.recipient}</TableCell>
                <TableCell>{row.subject}</TableCell>
                <TableCell><Badge variant="secondary">{row.type}</Badge></TableCell>
                <TableCell>
                  <Badge className={row.status === 'Entregado' ? 'bg-success/15 text-success border-0' : 'bg-destructive/15 text-destructive border-0'}>
                    {row.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{format(row.sentAt, 'd MMM yyyy HH:mm', { locale: es })}</TableCell>
                <TableCell className="text-muted-foreground">{row.openedAt ? format(row.openedAt, 'd MMM yyyy HH:mm', { locale: es }) : '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }

    if (reportType === 'signatures') {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Documento</TableHead>
              <TableHead>Firmante</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Fecha Firma</TableHead>
              <TableHead>IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockSignatureResults.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.document}</TableCell>
                <TableCell>{row.signer}</TableCell>
                <TableCell><Badge variant="secondary">{row.role}</Badge></TableCell>
                <TableCell>
                  <Badge className={
                    row.status === 'Firmado' ? 'bg-success/15 text-success border-0' :
                    row.status === 'Rechazado' ? 'bg-destructive/15 text-destructive border-0' :
                    'bg-warning/15 text-warning border-0'
                  }>
                    {row.status}
                  </Badge>
                </TableCell>
                <TableCell>{row.method}</TableCell>
                <TableCell className="text-muted-foreground">{row.signedAt ? format(row.signedAt, 'd MMM yyyy HH:mm', { locale: es }) : '—'}</TableCell>
                <TableCell className="font-mono text-xs">{row.ipAddress}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }

    // Tags report
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Etiqueta</TableHead>
            <TableHead className="text-center">Total Documentos</TableHead>
            <TableHead className="text-center">Firmados</TableHead>
            <TableHead className="text-center">Pendientes</TableHead>
            <TableHead className="text-center">Rechazados</TableHead>
            <TableHead className="text-center">% Completado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockTagResults.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">
                <Badge variant="secondary">{row.tag}</Badge>
              </TableCell>
              <TableCell className="text-center font-medium">{row.documents}</TableCell>
              <TableCell className="text-center text-success">{row.signed}</TableCell>
              <TableCell className="text-center text-warning">{row.pending}</TableCell>
              <TableCell className="text-center text-destructive">{row.rejected}</TableCell>
              <TableCell className="text-center">
                <div className="flex items-center gap-2 justify-center">
                  <Progress value={(row.signed / row.documents) * 100} className="w-16 h-2" />
                  <span className="text-xs">{((row.signed / row.documents) * 100).toFixed(0)}%</span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
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
            <FileSpreadsheet className="h-4 w-4" />Reportes Generados
            {reportJobs.filter(j => j.status === 'processing' || j.status === 'pending').length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {reportJobs.filter(j => j.status === 'processing' || j.status === 'pending').length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          {/* Filters Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5" />Filtros del Reporte</CardTitle>
              <CardDescription>Configure el tipo de reporte y sus filtros</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Report Type Select */}
                <div className="space-y-2">
                  <Label>Tipo de Reporte *</Label>
                  <Select value={reportType} onValueChange={(v) => { setReportType(v as ReportType); setHasSearched(false); }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(reportTypeLabels) as [ReportType, { label: string; icon: React.ElementType }][]).map(([key, { label, icon: Icon }]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Conditional: Email status filter */}
                {reportType === 'emails' && (
                  <div className="space-y-2">
                    <Label>Estado de Envío</Label>
                    <Select value={filters.emailStatus} onValueChange={(v) => setFilters(prev => ({ ...prev, emailStatus: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="delivered">Entregado</SelectItem>
                        <SelectItem value="not_delivered">No entregado</SelectItem>
                        <SelectItem value="opened">Abierto</SelectItem>
                        <SelectItem value="bounced">Rebotado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Conditional: Tag filter */}
                {reportType === 'tags' && (
                  <div className="space-y-2">
                    <Label>Etiqueta</Label>
                    <Select value={filters.selectedTag} onValueChange={(v) => setFilters(prev => ({ ...prev, selectedTag: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las etiquetas</SelectItem>
                        {tags.map(tag => (
                          <SelectItem key={tag.id} value={tag.id}>{tag.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

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
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  {dateError}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <Button onClick={handleSearch} disabled={isSearching || !!dateError} className="bg-gradient-primary hover:opacity-90">
                  {isSearching ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Buscando...</>
                  ) : (
                    <><Search className="h-4 w-4 mr-2" />Buscar</>
                  )}
                </Button>
                {hasSearched && (
                  <Button variant="outline" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar CSV
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Results Card */}
          <Card>
            <CardHeader>
              <CardTitle>Resultados</CardTitle>
              {hasSearched && (
                <CardDescription>
                  {reportType === 'emails' ? `${mockEmailResults.length} correos encontrados` :
                   reportType === 'signatures' ? `${mockSignatureResults.length} registros de firma` :
                   `${mockTagResults.length} etiquetas encontradas`}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {renderResultsTable()}
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
              {reportJobs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No hay reportes generados aún</p>
              ) : reportJobs.map((job) => (
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
                      {job.processedRecords} registros procesados
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
