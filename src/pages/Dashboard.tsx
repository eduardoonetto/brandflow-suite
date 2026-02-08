import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useDocuments } from '@/context/DocumentContext';
import { useInstitution } from '@/context/InstitutionContext';
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
  XCircle,
  FileClock,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Personal Dashboard - simplified view
function PersonalDashboard() {
  const { user } = useAuth();
  const { pendingDocuments, inProgressDocuments, signedDocuments, rejectedDocuments } = useDocuments();
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Pendientes de Firma',
      count: pendingDocuments.length,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      path: '/documents/pending',
    },
    {
      title: 'En Proceso',
      count: inProgressDocuments.length,
      icon: FileClock,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      path: '/documents/in-progress',
    },
    {
      title: 'Firmados',
      count: signedDocuments.length,
      icon: CheckCircle2,
      color: 'text-success',
      bgColor: 'bg-success/10',
      path: '/documents/signed',
    },
    {
      title: 'Rechazados',
      count: rejectedDocuments.length,
      icon: XCircle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      path: '/documents/rejected',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Bienvenido, {user?.name.split(' ')[0]}
        </h1>
        <p className="text-muted-foreground">
          Tu resumen personal de documentos
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card 
            key={card.title} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(card.path)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className={cn('p-3 rounded-xl', card.bgColor)}>
                  <card.icon className={cn('h-6 w-6', card.color)} />
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold">{card.count}</p>
                <p className="text-sm text-muted-foreground">{card.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Accede rápidamente a tus documentos
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pendingDocuments.length > 0 && (
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
          )}
          {pendingDocuments.length === 0 && (
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

// Organization Dashboard - full view (original)
function OrganizationDashboard() {
  const { user } = useAuth();
  const { currentInstitution } = useInstitution();
  const { documents, pendingDocuments, signedDocuments, rejectedDocuments } = useDocuments();
  const navigate = useNavigate();

  const statCards = [
    {
      title: 'Documentos Totales',
      value: documents.length,
      icon: FileText,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Pendientes de Firma',
      value: pendingDocuments.length,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Firmados',
      value: signedDocuments.length,
      icon: CheckCircle2,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Rechazados',
      value: rejectedDocuments.length,
      icon: XCircle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ];

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
            {currentInstitution?.name}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
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
                    {doc.status === 'signed' ? 'Firmado' :
                     doc.status === 'pending' ? 'Pendiente de firma' :
                     doc.status === 'rejected' ? 'Rechazado' :
                     'Borrador'}
                  </p>
                </div>
              </div>
            ))}
            {documents.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No hay documentos recientes
              </p>
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
