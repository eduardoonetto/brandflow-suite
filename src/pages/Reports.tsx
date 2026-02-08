import React, { useEffect, useState } from 'react';
import { kpiService } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { KPIData, DocumentStatus } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
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
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { Download, Calendar, TrendingUp, Users, FileText, Clock } from 'lucide-react';
import { formatPercentage } from '@/utils/formatters';

const statusColors: Record<DocumentStatus, string> = {
  draft: 'hsl(220 9% 46%)',
  pending: 'hsl(38 92% 50%)',
  signed: 'hsl(142 71% 45%)',
  rejected: 'hsl(0 84% 60%)',
  trashed: 'hsl(220 9% 46%)',
};

export default function Reports() {
  const { institution } = useAuth();
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await kpiService.getDashboardData(institution?.id || '');
        setKpiData(response.data);
      } catch (error) {
        console.error('Failed to fetch KPIs:', error);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [institution, dateRange]);

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
    objetivo: 2, // Target time
  })) : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Reportes y Analíticas</h1>
          <p className="text-muted-foreground">
            Métricas de rendimiento y estadísticas de uso
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 días</SelectItem>
              <SelectItem value="30">Últimos 30 días</SelectItem>
              <SelectItem value="90">Últimos 90 días</SelectItem>
              <SelectItem value="365">Último año</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">
                  {kpiData ? formatPercentage(kpiData.completionRate) : '—'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Tasa de Finalización
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-3xl font-bold">
                  {kpiData ? `${kpiData.avgSigningTime.toFixed(1)}d` : '—'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Tiempo Promedio Firma
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-3xl font-bold">
                  {kpiData ? kpiData.documentsByStatus.signed : '—'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Documentos Firmados
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-3xl font-bold">
                  {kpiData ? Object.keys(kpiData.signingTimeByDepartment).length : '—'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Departamentos Activos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Documents Over Time */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tendencia de Documentos</CardTitle>
            <CardDescription>
              Evolución de documentos creados en el período seleccionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={kpiData?.documentsOverTime || []}>
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
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
                    labelFormatter={(value) => new Date(value).toLocaleDateString('es-CL', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorGradient)"
                    name="Documentos"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Estado</CardTitle>
            <CardDescription>
              Proporción de documentos según su estado actual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
                  <span className="text-sm text-muted-foreground">
                    {entry.name}: {entry.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Signing Time by Department */}
        <Card>
          <CardHeader>
            <CardTitle>Tiempo de Firma por Departamento</CardTitle>
            <CardDescription>
              Comparación con objetivo de 2 días
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" domain={[0, 'auto']} />
                  <YAxis dataKey="name" type="category" className="text-xs" width={80} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number, name: string) => [
                      `${value} días`, 
                      name === 'tiempo' ? 'Actual' : 'Objetivo'
                    ]}
                  />
                  <Legend />
                  <Bar 
                    dataKey="tiempo" 
                    fill="hsl(var(--primary))" 
                    radius={[0, 4, 4, 0]}
                    name="Actual"
                  />
                  <Bar 
                    dataKey="objetivo" 
                    fill="hsl(var(--muted-foreground) / 0.3)" 
                    radius={[0, 4, 4, 0]}
                    name="Objetivo"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
