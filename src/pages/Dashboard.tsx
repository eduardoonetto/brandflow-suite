import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDocuments } from '@/context/DocumentContext';
import { kpiService } from '@/services/api';
import { KPIData, DocumentStatus } from '@/types';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Send
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { formatPercentage } from '@/utils/formatters';
import { cn } from '@/lib/utils';

const statusColors: Record<DocumentStatus, string> = {
  draft: 'hsl(220 9% 46%)',
  pending: 'hsl(38 92% 50%)',
  signed: 'hsl(142 71% 45%)',
  rejected: 'hsl(0 84% 60%)',
};

export default function Dashboard() {
  const { user, institution } = useAuth();
  const { documents } = useDocuments();
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const response = await kpiService.getDashboardData(institution?.id || '');
        setKpiData(response.data);
      } catch (error) {
        console.error('Failed to fetch KPIs:', error);
      }
      setIsLoading(false);
    };

    fetchKPIs();
  }, [institution]);

  const statCards = [
    {
      title: 'Documentos Totales',
      value: documents.length,
      change: '+12%',
      trend: 'up',
      icon: FileText,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Pendientes de Firma',
      value: documents.filter(d => d.status === 'pending').length,
      change: '-5%',
      trend: 'down',
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Tasa de Finalización',
      value: kpiData ? formatPercentage(kpiData.completionRate) : '—',
      change: '+3.2%',
      trend: 'up',
      icon: CheckCircle2,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Tiempo Promedio',
      value: kpiData ? `${kpiData.avgSigningTime.toFixed(1)} días` : '—',
      change: '-0.5 días',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
  ];

  const pieData = kpiData ? Object.entries(kpiData.documentsByStatus).map(([status, count]) => ({
    name: status === 'draft' ? 'Borrador' 
      : status === 'pending' ? 'Pendiente'
      : status === 'signed' ? 'Firmado'
      : 'Rechazado',
    value: count,
    color: statusColors[status as DocumentStatus],
  })) : [];

  const deptData = kpiData ? Object.entries(kpiData.signingTimeByDepartment).map(([dept, time]) => ({
    name: dept,
    tiempo: time,
  })) : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Bienvenido, {user?.name.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground">
            Aquí está el resumen de tu actividad
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="px-3 py-1.5 bg-muted rounded-full">
            {institution?.name}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="card-interactive">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className={cn('p-2 rounded-lg', stat.bgColor)}>
                  <stat.icon className={cn('h-5 w-5', stat.color)} />
                </div>
                <div className={cn(
                  'flex items-center gap-1 text-xs font-medium',
                  stat.trend === 'up' ? 'text-success' : 'text-destructive'
                )}>
                  {stat.change}
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart - Documents Over Time */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Documentos en el Tiempo</CardTitle>
            <CardDescription>
              Cantidad de documentos creados por semana
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={kpiData?.documentsOverTime || []}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tickFormatter={(value) => new Date(value).toLocaleDateString('es-CL', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCount)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart - Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Documentos</CardTitle>
            <CardDescription>
              Distribución por estado actual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {pieData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div 
                    className="h-3 w-3 rounded-full" 
                    style={{ backgroundColor: entry.color }} 
                  />
                  <span className="text-xs text-muted-foreground">
                    {entry.name} ({entry.value})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Signing Time by Department */}
        <Card>
          <CardHeader>
            <CardTitle>Tiempo de Firma por Departamento</CardTitle>
            <CardDescription>
              Promedio en días por departamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="name" type="category" className="text-xs" width={80} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value} días`, 'Tiempo promedio']}
                  />
                  <Bar 
                    dataKey="tiempo" 
                    fill="hsl(var(--secondary))" 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>
              Últimas acciones en la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.slice(0, 5).map((doc) => (
                <div 
                  key={doc.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className={cn(
                    'h-10 w-10 rounded-lg flex items-center justify-center',
                    doc.status === 'signed' ? 'bg-success/10 text-success' :
                    doc.status === 'pending' ? 'bg-warning/10 text-warning' :
                    doc.status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                    'bg-muted text-muted-foreground'
                  )}>
                    {doc.status === 'signed' ? <CheckCircle2 className="h-5 w-5" /> :
                     doc.status === 'pending' ? <Send className="h-5 w-5" /> :
                     <FileText className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.status === 'signed' ? 'Firmado' :
                       doc.status === 'pending' ? 'Pendiente de firma' :
                       doc.status === 'rejected' ? 'Rechazado' :
                       'Borrador'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
