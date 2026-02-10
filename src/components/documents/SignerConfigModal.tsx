import React, { useState } from 'react';
import { useInstitution } from '@/context/InstitutionContext';
import { DocumentSigner, InstitutionRole, SignerType, SignatureType, NotificationType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { 
  Plus, 
  Trash2, 
  User, 
  Users,
  Shield,
  PenLine,
  Eye,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SignerConfig {
  id: string;
  type: 'individual' | 'role';
  email?: string;
  name?: string;
  rut?: string;
  roleId?: InstitutionRole;
  specificUserId?: string; // specific person from a role
  anyoneWithRole?: boolean; // or anyone with that role
  signerType: SignerType;
  signatureType: SignatureType;
  notificationType: NotificationType;
}

interface SignerConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (signers: Omit<DocumentSigner, 'id' | 'documentId' | 'status'>[]) => void;
}

const roleColors: Record<InstitutionRole, string> = {
  'Admin': '220 80% 45%',
  'RRHH': '142 71% 45%',
  'Trabajador': '38 92% 50%',
  'Finanzas': '280 70% 50%',
  'Legal': '175 65% 42%',
  'Gerencia': '340 75% 55%',
};

const notificationLabels: Record<NotificationType, string> = {
  'all': 'Todas las notificaciones',
  'pending': 'Solo cuando esté pendiente',
  'rejected': 'Solo al rechazar',
  'signed': 'Solo al firmar todos',
};

export function SignerConfigModal({ open, onOpenChange, onConfirm }: SignerConfigModalProps) {
  const { institutionUsers } = useInstitution();
  const [signers, setSigners] = useState<SignerConfig[]>([]);
  const [showRoleUsersModal, setShowRoleUsersModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<InstitutionRole | null>(null);
  const [selectingForSignerId, setSelectingForSignerId] = useState<string | null>(null);

  const addSigner = () => {
    setSigners([
      ...signers,
      {
        id: `temp-${Date.now()}`,
        type: 'individual',
        email: '',
        name: '',
        rut: '',
        signerType: 'signer',
        signatureType: 'pin',
        notificationType: 'all',
        anyoneWithRole: true,
      },
    ]);
  };

  const removeSigner = (id: string) => {
    setSigners(signers.filter(s => s.id !== id));
  };

  const updateSigner = (id: string, updates: Partial<SignerConfig>) => {
    setSigners(signers.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleConfirm = () => {
    const mappedSigners = signers.map((s, idx) => {
      // If role-based with specific user, populate their info
      if (s.type === 'role' && s.specificUserId) {
        const user = institutionUsers.find(u => u.userId === s.specificUserId);
        return {
          email: user?.user.email || '',
          name: user?.user.name || '',
          rut: s.rut,
          roleId: s.roleId,
          order: idx + 1,
          signerType: s.signerType,
          signatureType: s.signatureType,
          notificationType: s.notificationType,
        };
      }
      return {
        email: s.email || '',
        name: s.name || (s.anyoneWithRole ? `Cualquiera con rol ${s.roleId}` : ''),
        rut: s.rut,
        roleId: s.roleId,
        order: idx + 1,
        signerType: s.signerType,
        signatureType: s.signatureType,
        notificationType: s.notificationType,
      };
    });
    onConfirm(mappedSigners);
    setSigners([]);
    onOpenChange(false);
  };

  const getUsersByRole = (role: InstitutionRole) => {
    return institutionUsers.filter(iu => iu.roles.includes(role));
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSelectSpecificUser = (signerId: string, userId: string, userName: string, userEmail: string) => {
    updateSigner(signerId, { 
      specificUserId: userId, 
      anyoneWithRole: false,
      name: userName,
      email: userEmail,
    });
    setShowRoleUsersModal(false);
    setSelectingForSignerId(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configurar Firmantes</DialogTitle>
            <DialogDescription>
              Agregue los firmantes del documento y configure el tipo de firma
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {signers.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground mb-4">No hay firmantes agregados</p>
                <Button onClick={addSigner} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Firmante
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {signers.map((signer, idx) => (
                  <div key={signer.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Firmante {idx + 1}</span>
                      <Button variant="ghost" size="icon" onClick={() => removeSigner(signer.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>

                    {/* Type selection */}
                    <div>
                      <Label className="text-xs text-muted-foreground">Tipo de Firmante</Label>
                      <RadioGroup
                        value={signer.type}
                        onValueChange={(v) => updateSigner(signer.id, { type: v as 'individual' | 'role', specificUserId: undefined, anyoneWithRole: true })}
                        className="flex gap-4 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="individual" id={`ind-${signer.id}`} />
                          <Label htmlFor={`ind-${signer.id}`} className="flex items-center gap-2 cursor-pointer">
                            <User className="h-4 w-4" />Individual
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="role" id={`role-${signer.id}`} />
                          <Label htmlFor={`role-${signer.id}`} className="flex items-center gap-2 cursor-pointer">
                            <Shield className="h-4 w-4" />Por Rol
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {signer.type === 'individual' ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <Label>RUT</Label>
                          <Input placeholder="12.345.678-9" value={signer.rut || ''} onChange={(e) => updateSigner(signer.id, { rut: e.target.value })} />
                        </div>
                        <div>
                          <Label>Nombre</Label>
                          <Input placeholder="Nombre completo" value={signer.name || ''} onChange={(e) => updateSigner(signer.id, { name: e.target.value })} />
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input type="email" placeholder="correo@ejemplo.com" value={signer.email || ''} onChange={(e) => updateSigner(signer.id, { email: e.target.value })} />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <Label>Seleccionar Rol</Label>
                          <div className="flex items-center gap-2">
                            <Select value={signer.roleId} onValueChange={(v) => updateSigner(signer.id, { roleId: v as InstitutionRole, specificUserId: undefined, anyoneWithRole: true })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione un rol" />
                              </SelectTrigger>
                              <SelectContent>
                                {(['Admin', 'RRHH', 'Trabajador', 'Finanzas', 'Legal', 'Gerencia'] as InstitutionRole[]).map(role => (
                                  <SelectItem key={role} value={role}>{role}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {signer.roleId && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedRole(signer.roleId!);
                                  setSelectingForSignerId(signer.id);
                                  setShowRoleUsersModal(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Seleccionar ({getUsersByRole(signer.roleId).length})
                              </Button>
                            )}
                          </div>
                        </div>

                        {signer.roleId && (
                          <div className="bg-muted/50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Checkbox
                                id={`anyone-${signer.id}`}
                                checked={signer.anyoneWithRole}
                                onCheckedChange={(checked) => updateSigner(signer.id, { 
                                  anyoneWithRole: !!checked, 
                                  specificUserId: checked ? undefined : signer.specificUserId 
                                })}
                              />
                              <Label htmlFor={`anyone-${signer.id}`} className="text-sm cursor-pointer">
                                Cualquier persona con el rol {signer.roleId}
                              </Label>
                            </div>
                            {signer.specificUserId && !signer.anyoneWithRole && (
                              <p className="text-sm text-primary font-medium">
                                ✓ {signer.name} ({signer.email})
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Signature config */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label>Tipo de Participante</Label>
                        <Select value={signer.signerType} onValueChange={(v) => updateSigner(signer.id, { signerType: v as SignerType })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="signer"><div className="flex items-center gap-2"><PenLine className="h-4 w-4" />Firmante</div></SelectItem>
                            <SelectItem value="approver"><div className="flex items-center gap-2"><Eye className="h-4 w-4" />Visador</div></SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Tipo de Firma</Label>
                        <Select value={signer.signatureType} onValueChange={(v) => updateSigner(signer.id, { signatureType: v as SignatureType })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pin">PIN por Email</SelectItem>
                            <SelectItem value="cedula">Cédula de Identidad</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="flex items-center gap-1"><Bell className="h-3 w-3" />Notificación</Label>
                        <Select value={signer.notificationType} onValueChange={(v) => updateSigner(signer.id, { notificationType: v as NotificationType })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="rejected">Rechazo</SelectItem>
                            <SelectItem value="signed">Firmado por todos</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}

                <Button onClick={addSigner} variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Otro Firmante
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleConfirm} disabled={signers.length === 0}>Confirmar Firmantes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Users Modal - with selection capability */}
      <Dialog open={showRoleUsersModal} onOpenChange={setShowRoleUsersModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Badge
                style={{ 
                  backgroundColor: selectedRole ? `hsl(${roleColors[selectedRole]} / 0.15)` : undefined,
                  color: selectedRole ? `hsl(${roleColors[selectedRole]})` : undefined
                }}
              >
                {selectedRole}
              </Badge>
              Seleccionar usuario
            </DialogTitle>
            <DialogDescription>
              Elija una persona específica o deje "cualquiera con este rol"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {selectedRole && getUsersByRole(selectedRole).map(iu => (
              <button
                key={iu.id}
                onClick={() => {
                  if (selectingForSignerId) {
                    handleSelectSpecificUser(selectingForSignerId, iu.userId, iu.user.name, iu.user.email);
                  }
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
              >
                <Avatar>
                  <AvatarFallback>{getInitials(iu.user.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{iu.user.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{iu.user.email}</p>
                </div>
              </button>
            ))}
            {selectedRole && getUsersByRole(selectedRole).length === 0 && (
              <p className="text-center text-muted-foreground py-4">No hay usuarios con este rol</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleUsersModal(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
