import React from 'react';
import { useInstitution } from '@/context/InstitutionContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2, User, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      <SelectTrigger 
        className={cn(
          'w-full border-sidebar-border transition-all',
          currentInstitution?.type === 'organization' 
            ? 'bg-primary/10 border-primary/30 text-primary-foreground' 
            : 'bg-sidebar-accent/50'
        )}
      >
        <SelectValue placeholder="Seleccionar institución">
          <div className="flex items-center gap-2">
            {currentInstitution?.type === 'personal' ? (
              <User className="h-4 w-4" />
            ) : (
              <Building2 className="h-4 w-4 text-primary" />
            )}
            <span className="truncate font-medium">{currentInstitution?.name}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {userInstitutions.map((inst) => (
          <SelectItem key={inst.id} value={inst.id}>
            <div className="flex items-center gap-2 w-full">
              {inst.type === 'personal' ? (
                <User className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Building2 className="h-4 w-4 text-primary" />
              )}
              <span className="flex-1">{inst.name}</span>
              {inst.type === 'personal' && (
                <span className="text-xs text-muted-foreground">(Personal)</span>
              )}
              {currentInstitution?.id === inst.id && (
                <Check className="h-4 w-4 text-primary ml-auto" />
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
