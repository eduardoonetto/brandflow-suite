import React, { useState } from 'react';
import { useInstitution } from '@/context/InstitutionContext';
import { InstitutionRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Search, 
  Users, 
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  Shield
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CreateUserModal } from '@/components/users/CreateUserModal';
import { useToast } from '@/hooks/use-toast';

const roleColors: Record<InstitutionRole, string> = {
  'Admin': '220 80% 45%',
  'RRHH': '142 71% 45%',
  'Trabajador': '38 92% 50%',
  'Finanzas': '280 70% 50%',
  'Legal': '175 65% 42%',
  'Gerencia': '340 75% 55%',
};

export default function UsersPage() {
  const { currentInstitution, institutionUsers, isPersonalInstitution } = useInstitution();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Don't show users for personal institutions
  if (isPersonalInstitution) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold mb-1">Sin usuarios</h3>
        <p className="text-muted-foreground text-sm">
          Las instituciones personales no tienen gestión de usuarios
        </p>
      </div>
    );
  }

  const filteredUsers = institutionUsers.filter(iu => {
    const matchesSearch = !searchQuery || 
      iu.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      iu.user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || iu.roles.includes(roleFilter as InstitutionRole);
    
    return matchesSearch && matchesRole;
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const roleStats = institutionUsers.reduce((acc, iu) => {
    iu.roles.forEach(role => {
      acc[role] = (acc[role] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const handleUserCreated = () => {
    toast({
      title: 'Usuario creado',
      description: 'El usuario ha sido añadido a la institución',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <p className="text-muted-foreground">
            Gestiona los usuarios de {currentInstitution?.name}
          </p>
        </div>
        
        <Button 
          className="bg-gradient-primary hover:opacity-90"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{institutionUsers.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        {Object.entries(roleStats).slice(0, 5).map(([role, count]) => (
          <Card key={role}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{count}</p>
              <Badge 
                className="mt-1"
                style={{ 
                  backgroundColor: `hsl(${roleColors[role as InstitutionRole]} / 0.15)`,
                  color: `hsl(${roleColors[role as InstitutionRole]})`
                }}
              >
                {role}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar usuarios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Filtrar por rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los roles</SelectItem>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="RRHH">RRHH</SelectItem>
            <SelectItem value="Trabajador">Trabajador</SelectItem>
            <SelectItem value="Finanzas">Finanzas</SelectItem>
            <SelectItem value="Legal">Legal</SelectItem>
            <SelectItem value="Gerencia">Gerencia</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>
            {filteredUsers.length} usuarios en esta institución
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead className="hidden md:table-cell">Fecha Ingreso</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((iu) => (
                <TableRow key={iu.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {getInitials(iu.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="font-medium block">{iu.user.name}</span>
                        <span className="text-xs text-muted-foreground sm:hidden">{iu.user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden sm:table-cell">
                    {iu.user.email}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {iu.roles.map(role => (
                        <Badge
                          key={role}
                          className="text-xs"
                          style={{ 
                            backgroundColor: `hsl(${roleColors[role]} / 0.15)`,
                            color: `hsl(${roleColors[role]})`
                          }}
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden md:table-cell">
                    {format(iu.joinedAt, 'd MMM yyyy', { locale: es })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar Roles
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" />
                          Enviar Email
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create User Modal */}
      <CreateUserModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={handleUserCreated}
      />
    </div>
  );
}
