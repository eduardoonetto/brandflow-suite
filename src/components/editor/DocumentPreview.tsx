import React from 'react';
import { cn } from '@/lib/utils';
import { replaceVariables, highlightVariables } from '@/utils/variables';
import { DocumentStatus } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DocumentPreviewProps {
  content: string;
  variables: Record<string, string>;
  status: DocumentStatus;
  title: string;
}

export function DocumentPreview({ 
  content, 
  variables, 
  status,
  title 
}: DocumentPreviewProps) {
  // Replace variables and highlight remaining ones
  const processedContent = React.useMemo(() => {
    // Format date values for display
    const formattedVars = { ...variables };
    Object.entries(formattedVars).forEach(([key, value]) => {
      if (value && !isNaN(Date.parse(value)) && key.toLowerCase().includes('fecha')) {
        try {
          formattedVars[key] = format(new Date(value), 'PPP', { locale: es });
        } catch {
          // Keep original value if parsing fails
        }
      }
    });

    let result = replaceVariables(content, formattedVars);
    result = highlightVariables(result);
    return result;
  }, [content, variables]);

  return (
    <div className="relative bg-card rounded-xl border h-full flex flex-col overflow-hidden">
      {/* Simulated document header */}
      <div className="bg-muted/30 border-b px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold text-center">{title}</h2>
          <p className="text-xs text-muted-foreground text-center mt-1">
            Vista previa del documento
          </p>
        </div>
      </div>

      {/* Document content area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div 
          className="max-w-2xl mx-auto prose prose-sm prose-slate"
          style={{ 
            fontFamily: 'Georgia, serif',
            lineHeight: 1.8,
          }}
        >
          <div 
            dangerouslySetInnerHTML={{ __html: processedContent.replace(/\n/g, '<br/>') }}
          />
        </div>
      </div>

      {/* Watermark overlay for drafts */}
      {status === 'draft' && (
        <div className="watermark-draft" />
      )}

      {/* Footer with document info */}
      <div className="bg-muted/30 border-t px-6 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
          <span>Documento generado por SignFlow</span>
          <span>{format(new Date(), 'PPP', { locale: es })}</span>
        </div>
      </div>
    </div>
  );
}
