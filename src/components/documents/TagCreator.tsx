import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Plus, Tag as TagIcon, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tag } from '@/types';

interface TagCreatorProps {
  existingTags: Tag[];
  selectedTags: string[];
  onTagSelect: (tagId: string) => void;
  onTagCreate: (name: string, color: string) => void;
}

const predefinedColors = [
  '220 80% 50%',   // Blue
  '142 76% 36%',   // Green
  '0 84% 60%',     // Red
  '38 92% 50%',    // Orange
  '262 83% 58%',   // Purple
  '174 84% 32%',   // Teal
  '326 80% 50%',   // Pink
  '43 96% 56%',    // Yellow
];

export function TagCreator({ 
  existingTags, 
  selectedTags, 
  onTagSelect, 
  onTagCreate 
}: TagCreatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(predefinedColors[0]);

  const handleCreateTag = () => {
    if (newTagName.trim()) {
      // Check if tag already exists
      const existing = existingTags.find(
        t => t.name.toLowerCase() === newTagName.toLowerCase().trim()
      );
      
      if (existing) {
        onTagSelect(existing.id);
      } else {
        onTagCreate(newTagName.trim(), selectedColor);
      }
      
      setNewTagName('');
      setIsCreating(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <TagIcon className="h-4 w-4" />
          Etiquetas
          {selectedTags.length > 0 && (
            <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-xs">
              {selectedTags.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Etiquetas</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCreating(!isCreating)}
              className="h-7 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Nueva
            </Button>
          </div>

          {/* Create new tag */}
          {isCreating && (
            <div className="space-y-2 p-2 border rounded-lg bg-muted/50">
              <Input
                placeholder="Nombre de etiqueta"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="h-8 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateTag();
                  }
                }}
              />
              
              {/* Color selector */}
              <div className="flex flex-wrap gap-1.5">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      'h-6 w-6 rounded-full transition-all',
                      selectedColor === color && 'ring-2 ring-offset-2 ring-primary'
                    )}
                    style={{ backgroundColor: `hsl(${color})` }}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleCreateTag}
                  disabled={!newTagName.trim()}
                  className="flex-1 h-7 text-xs"
                >
                  Crear
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsCreating(false);
                    setNewTagName('');
                  }}
                  className="h-7 text-xs"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Existing tags */}
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {existingTags.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">
                No hay etiquetas creadas
              </p>
            ) : (
              existingTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => onTagSelect(tag.id)}
                  className={cn(
                    'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors',
                    selectedTags.includes(tag.id) 
                      ? 'bg-primary/10' 
                      : 'hover:bg-muted'
                  )}
                >
                  <span 
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: `hsl(${tag.color})` }}
                  />
                  <span className="flex-1 text-left truncate">{tag.name}</span>
                  {selectedTags.includes(tag.id) && (
                    <Check className="h-4 w-4 text-primary shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
