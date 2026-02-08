import React, { useState, useRef } from 'react';
import { useInstitution } from '@/context/InstitutionContext';
import { InstitutionRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  User, 
  Mail, 
  Upload,
  Loader2,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const roleColors: Record<InstitutionRole, string> = {
  'Admin': '220 80% 45%',
  'RRHH': '142 71% 45%',
  'Trabajador': '38 92% 50%',
  'Finanzas': '280 70% 50%',
  'Legal': '175 65% 42%',
  'Gerencia': '340 75% 55%',
};

const availableRoles: InstitutionRole[] = ['Admin', 'RRHH', 'Trabajador', 'Finanzas', 'Legal', 'Gerencia'];

export function CreateUserModal({ open, onOpenChange, onSuccess }: CreateUserModalProps) {
  const { currentInstitution } = useInstitution();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rut, setRut] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<InstitutionRole[]>([]);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRoleToggle = (role: InstitutionRole) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async () => {
    if (!name || !email || selectedRoles.length === 0) return;

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    onSuccess?.();
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setRut('');
    setSelectedRoles([]);
    setAvatarUrl('');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo Usuario</DialogTitle>
          <DialogDescription>
            Añadir un usuario a {currentInstitution?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt="Avatar" />
              ) : null}
              <AvatarFallback className="text-lg bg-gradient-primary text-primary-foreground">
                {name ? getInitials(name) : <User className="h-6 w-6" />}
              </AvatarFallback>
            </Avatar>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Subir foto
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                JPG o PNG. Máximo 1MB.
              </p>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label>Nombre Completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Juan Pérez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label>Correo Electrónico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* RUT */}
          <div className="space-y-2">
            <Label>RUT (opcional)</Label>
            <Input
              placeholder="12.345.678-9"
              value={rut}
              onChange={(e) => setRut(e.target.value)}
            />
          </div>

          {/* Roles */}
          <div className="space-y-2">
            <Label>Roles</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Seleccione uno o más roles para este usuario
            </p>
            <div className="flex flex-wrap gap-2">
              {availableRoles.map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleToggle(role)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                    selectedRoles.includes(role)
                      ? 'ring-2 ring-offset-2'
                      : 'opacity-60 hover:opacity-100'
                  )}
                  style={{ 
                    backgroundColor: `hsl(${roleColors[role]} / 0.15)`,
                    color: `hsl(${roleColors[role]})`,
                    ...(selectedRoles.includes(role) && {
                      ringColor: `hsl(${roleColors[role]})`
                    })
                  }}
                >
                  {selectedRoles.includes(role) && (
                    <X className="h-3 w-3" />
                  )}
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Selected roles summary */}
          {selectedRoles.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm text-muted-foreground">
                Se asignarán {selectedRoles.length} rol(es): {selectedRoles.join(', ')}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleCreate}
            disabled={isLoading || !name || !email || selectedRoles.length === 0}
            className="bg-gradient-primary"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            Crear Usuario
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
