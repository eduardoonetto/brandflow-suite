import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useDocuments } from '@/context/DocumentContext';
import { useInstitution } from '@/context/InstitutionContext';
import { kpiService } from '@/services/api';
import { KPIData, DocumentStatus } from '@/types';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { 
  FileText, Clock, CheckCircle2, XCircle, FileClock, ArrowRight, TrendingUp, Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { formatPercentage } from '@/utils/formatters';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts';

const statusColors: Record<DocumentStatus, string> = {
  draft: 'hsl(220 9% 46%)',
  pending: 'hsl(38 92% 50%)',
  signed: 'hsl(142 71% 45%)',
  rejected: 'hsl(0 84% 60%)',
  trashed: 'hsl(220 9% 46%)',
};

// Personal Dashboard - simplified
function PersonalDashboard() {
  const { user } = useAuth();
  const { pendingDocuments, inProgressDocuments, signedDocuments, rejectedDocuments } = useDocuments();
  const navigate = useNavigate();

  const cards = [
    { title: 'Pendientes de Firma', count: pendingDocuments.length, icon: Clock, color: 'text-warning', bgColor: 'bg-warning/10', path: '/documents/pending' },
    { title: 'En Proceso', count: inProgressDocuments.length, icon: FileClock, color: 'text-secondary', bgColor: 'bg-secondary/10', path: '/documents/in-progress' },
    { title: 'Firmados', count: signedDocuments.length, icon: CheckCircle2, color: 'text-success', bgColor: 'bg-success/10', path: '/documents/signed' },
    { title: 'Rechazados', count: rejectedDocuments.length, icon: XCircle, color: 'text-destructive', bgColor: 'bg-destructive/10', path: '/documents/rejected' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Bienvenido, {user?.name.split(' ')[0]}</h1>
        <p className="text-muted-foreground">Tu resumen personal de documentos</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.title} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(card.path)}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className={cn('p-3 rounded-xl', card.bgColor)}>
                  <card.icon className={cn('h-6 w-6', card.color)} />
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowRight className="h-4 w-4" /></Button>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold">{card.count}</p>
                <p className="text-sm text-muted-foreground">{card.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>Accede rápidamente a tus documentos</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pendingDocuments.length > 0 ? (
            <div 
              className="p-4 rounded-lg border bg-warning/5 border-warning/20 cursor-pointer hover:bg-warning/10 transition-colors"
              onClick={() => navigate('/documents/pending')}
            >
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-warning" />
                <div>
                  <p className="font-medium">Tienes {pendingDocuments.length} documento(s) por firmar</p>
                  <p className="text-sm text-muted-foreground">Haz clic para verlos</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg border bg-success/5 border-success/20">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-success" />
                <div>
                  <p className="font-medium">No tienes documentos pendientes</p>
                  <p className="text-sm text-muted-foreground">Estás al día</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Organization Dashboard - with statistics
function OrganizationDashboard() {
  const { user } = useAuth();
  const { currentInstitution } = useInstitution();
  const { documents, pendingDocuments, signedDocuments, rejectedDocuments } = useDocuments();
  const navigate = useNavigate();
  const [kpiData, setKpiData] = useState<KPIData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await kpiService.getDashboardData(currentInstitution?.id || '');
        setKpiData(response.data);
      } catch (error) {
        console.error('Failed to fetch KPIs:', error);
      }
    };
    fetchData();
  }, [currentInstitution]);

  const statCards = [
    { title: 'Documentos Totales', value: documents.length, icon: FileText, color: 'text-primary', bgColor: 'bg-primary/10' },
    { title: 'Pendientes de Firma', value: pendingDocuments.length, icon: Clock, color: 'text-warning', bgColor: 'bg-warning/10' },
    { title: 'Firmados', value: signedDocuments.length, icon: CheckCircle2, color: 'text-success', bgColor: 'bg-success/10' },
    { title: 'Rechazados', value: rejectedDocuments.length, icon: XCircle, color: 'text-destructive', bgColor: 'bg-destructive/10' },
  ];

  const pieData = kpiData ? Object.entries(kpiData.documentsByStatus)
    .filter(([status]) => status !== 'trashed')
    .map(([status, count]) => ({
      name: status === 'draft' ? 'Borrador' : status === 'pending' ? 'Pendiente' : status === 'signed' ? 'Firmado' : 'Rechazado',
      value: count,
      color: statusColors[status as DocumentStatus],
    })) : [];

  const deptData = kpiData ? Object.entries(kpiData.signingTimeByDepartment).map(([dept, time]) => ({
    name: dept, tiempo: time, objetivo: 2,
  })) : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Bienvenido, {user?.name.split(' ')[0]}</h1>
          <p className="text-muted-foreground">Aquí está el resumen de tu actividad</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="px-3 py-1.5 bg-muted rounded-full">{currentInstitution?.name}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="card-interactive">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className={cn('p-2 rounded-lg', stat.bgColor)}>
                  <stat.icon className={cn('h-5 w-5', stat.color)} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-bold">{kpiData ? formatPercentage(kpiData.completionRate) : '—'}</p>
              <p className="text-sm text-muted-foreground">Tasa de Finalización</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-3xl font-bold">{kpiData ? `${kpiData.avgSigningTime.toFixed(1)}d` : '—'}</p>
              <p className="text-sm text-muted-foreground">Tiempo Promedio Firma</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-3xl font-bold">{kpiData ? Object.keys(kpiData.signingTimeByDepartment).length : '—'}</p>
              <p className="text-sm text-muted-foreground">Departamentos Activos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tendencia de Documentos</CardTitle>
            <CardDescription>Evolución de documentos creados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={kpiData?.documentsOverTime || []}>
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" tickFormatter={(v) => new Date(v).toLocaleDateString('es-CL', { month: 'short', day: 'numeric' })} />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorGradient)" name="Documentos" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tiempo de Firma por Departamento</CardTitle>
            <CardDescription>Comparación con objetivo de 2 días</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="name" type="category" className="text-xs" width={80} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="tiempo" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Actual" />
                  <Bar dataKey="objetivo" fill="hsl(var(--muted-foreground) / 0.3)" radius={[0, 4, 4, 0]} name="Objetivo" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>Últimas acciones en la plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.slice(0, 5).map((doc) => (
              <div 
                key={doc.id}
                className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/documents/${doc.id}`)}
              >
                <div className={cn(
                  'h-10 w-10 rounded-lg flex items-center justify-center shrink-0',
                  doc.status === 'signed' ? 'bg-success/10 text-success' :
                  doc.status === 'pending' ? 'bg-warning/10 text-warning' :
                  doc.status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                  'bg-muted text-muted-foreground'
                )}>
                  {doc.status === 'signed' ? <CheckCircle2 className="h-5 w-5" /> :
                   doc.status === 'pending' ? <Clock className="h-5 w-5" /> :
                   doc.status === 'rejected' ? <XCircle className="h-5 w-5" /> :
                   <FileText className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{doc.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.status === 'signed' ? 'Firmado' : doc.status === 'pending' ? 'Pendiente de firma' : doc.status === 'rejected' ? 'Rechazado' : 'Borrador'}
                  </p>
                </div>
              </div>
            ))}
            {documents.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No hay documentos recientes</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Dashboard() {
  const { isPersonalInstitution } = useInstitution();
  return isPersonalInstitution ? <PersonalDashboard /> : <OrganizationDashboard />;
}
