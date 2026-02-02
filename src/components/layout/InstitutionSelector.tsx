import React from 'react';
import { useInstitution } from '@/context/InstitutionContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2, User } from 'lucide-react';

export function InstitutionSelector() {
  const { 
    currentInstitution, 
    userInstitutions, 
    setCurrentInstitution 
  } = useInstitution();

  return (
    <Select
      value={currentInstitution?.id || ''}
      onValueChange={(value) => {
        const institution = userInstitutions.find(i => i.id === value);
        if (institution) {
          setCurrentInstitution(institution);
        }
      }}
    >
      <SelectTrigger className="w-full bg-sidebar-accent/50 border-sidebar-border">
        <SelectValue placeholder="Seleccionar institución">
          <div className="flex items-center gap-2">
            {currentInstitution?.type === 'personal' ? (
              <User className="h-4 w-4" />
            ) : (
              <Building2 className="h-4 w-4" />
            )}
            <span className="truncate">{currentInstitution?.name}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {userInstitutions.map((inst) => (
          <SelectItem key={inst.id} value={inst.id}>
            <div className="flex items-center gap-2">
              {inst.type === 'personal' ? (
                <User className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Building2 className="h-4 w-4 text-muted-foreground" />
              )}
              <span>{inst.name}</span>
              {inst.type === 'personal' && (
                <span className="text-xs text-muted-foreground">(Personal)</span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
