import React, { useEffect, useState } from 'react';
import { DocumentVariable } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarIcon, Type, Hash, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface VariablePanelProps {
  variables: DocumentVariable[];
  values: Record<string, string>;
  onValueChange: (key: string, value: string) => void;
  completionPercentage: number;
}

export function VariablePanel({ 
  variables, 
  values, 
  onValueChange,
  completionPercentage 
}: VariablePanelProps) {
  const getIcon = (type: DocumentVariable['type']) => {
    switch (type) {
      case 'date':
        return CalendarIcon;
      case 'number':
        return Hash;
      default:
        return Type;
    }
  };

  return (
    <div className="bg-card rounded-xl border h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Variables del Documento</h3>
          <span className={cn(
            'text-sm font-medium',
            completionPercentage === 100 ? 'text-success' : 'text-warning'
          )}>
            {completionPercentage}% completo
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn(
              'h-full transition-all duration-300 rounded-full',
              completionPercentage === 100 ? 'bg-success' : 'bg-warning'
            )}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Variables List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {variables.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Type className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay variables detectadas</p>
            <p className="text-xs mt-1">
              Usa la sintaxis {"{{variable}}"} en el contenido
            </p>
          </div>
        ) : (
          variables.map(variable => {
            const Icon = getIcon(variable.type);
            const isFilled = values[variable.key]?.trim() !== '';
            
            return (
              <div key={variable.key} className="space-y-1.5">
                <Label className="text-sm flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  {variable.label}
                  {variable.required && (
                    <span className="text-destructive">*</span>
                  )}
                  {isFilled && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-success ml-auto" />
                  )}
                </Label>
                
                {variable.type === 'date' ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !values[variable.key] && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {values[variable.key] 
                          ? format(new Date(values[variable.key]), 'PPP', { locale: es })
                          : 'Seleccionar fecha'
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={values[variable.key] ? new Date(values[variable.key]) : undefined}
                        onSelect={(date) => 
                          onValueChange(variable.key, date?.toISOString() || '')
                        }
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                ) : variable.type === 'number' ? (
                  <Input
                    type="number"
                    placeholder={`Ingrese ${variable.label.toLowerCase()}`}
                    value={values[variable.key] || ''}
                    onChange={(e) => onValueChange(variable.key, e.target.value)}
                  />
                ) : (
                  <Input
                    type="text"
                    placeholder={`Ingrese ${variable.label.toLowerCase()}`}
                    value={values[variable.key] || ''}
                    onChange={(e) => onValueChange(variable.key, e.target.value)}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
