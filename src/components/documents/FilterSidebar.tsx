import React from 'react';
import { useDocuments } from '@/context/DocumentContext';
import { DocumentStatus } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Filter, 
  X, 
  CalendarIcon,
  Search,
  Tag
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const statusOptions: { value: DocumentStatus; label: string; color: string }[] = [
  { value: 'draft', label: 'Borrador', color: 'bg-muted text-muted-foreground' },
  { value: 'pending', label: 'Pendiente', color: 'bg-warning/15 text-warning' },
  { value: 'signed', label: 'Firmado', color: 'bg-success/15 text-success' },
  { value: 'rejected', label: 'Rechazado', color: 'bg-destructive/15 text-destructive' },
];

export function FilterSidebar() {
  const { filters, setFilters, tags } = useDocuments();

  const hasActiveFilters = 
    filters.status.length > 0 || 
    filters.tags.length > 0 || 
    filters.dateRange.from || 
    filters.dateRange.to ||
    filters.search;

  const clearFilters = () => {
    setFilters({
      status: [],
      tags: [],
      dateRange: {},
      search: '',
    });
  };

  const toggleStatus = (status: DocumentStatus) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    setFilters({ status: newStatus });
  };

  const toggleTag = (tagId: string) => {
    const newTags = filters.tags.includes(tagId)
      ? filters.tags.filter(t => t !== tagId)
      : [...filters.tags, tagId];
    setFilters({ tags: newTags });
  };

  return (
    <div className="w-72 shrink-0 bg-card rounded-xl border p-4 h-fit sticky top-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Filtros</span>
        </div>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="h-8 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <Label className="text-xs text-muted-foreground mb-2 block">
          Buscar
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar documentos..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="pl-9"
          />
        </div>
      </div>

      {/* Status Filter */}
      <div className="mb-6">
        <Label className="text-xs text-muted-foreground mb-2 block">
          Estado
        </Label>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map(status => (
            <button
              key={status.value}
              onClick={() => toggleStatus(status.value)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                filters.status.includes(status.value)
                  ? status.color + ' ring-2 ring-offset-2 ring-primary/20'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              )}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tags Filter */}
      <div className="mb-6">
        <Label className="text-xs text-muted-foreground mb-2 block">
          <Tag className="h-3 w-3 inline mr-1" />
          Etiquetas
        </Label>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                filters.tags.includes(tag.id)
                  ? 'ring-2 ring-offset-2 ring-primary/20'
                  : 'opacity-60 hover:opacity-100'
              )}
              style={{ 
                backgroundColor: `hsl(${tag.color} / 0.15)`,
                color: `hsl(${tag.color})`
              }}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      {/* Date Range Filter */}
      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">
          Rango de fechas
        </Label>
        <div className="space-y-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !filters.dateRange.from && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange.from 
                  ? format(filters.dateRange.from, 'PPP', { locale: es })
                  : 'Fecha inicio'
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateRange.from}
                onSelect={(date) => setFilters({ 
                  dateRange: { ...filters.dateRange, from: date } 
                })}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !filters.dateRange.to && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange.to 
                  ? format(filters.dateRange.to, 'PPP', { locale: es })
                  : 'Fecha fin'
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateRange.to}
                onSelect={(date) => setFilters({ 
                  dateRange: { ...filters.dateRange, to: date } 
                })}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
