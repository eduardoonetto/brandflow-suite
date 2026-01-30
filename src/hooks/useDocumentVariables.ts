import { useState, useCallback } from 'react';
import { extractVariables, inferVariableType, generateLabel } from '@/utils/variables';
import { DocumentVariable } from '@/types';

export function useDocumentVariables(initialContent: string = '') {
  const [variables, setVariables] = useState<DocumentVariable[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});

  const parseContent = useCallback((content: string) => {
    const extracted = extractVariables(content);
    
    const newVariables: DocumentVariable[] = extracted.map(key => ({
      key,
      type: inferVariableType(key),
      label: generateLabel(key),
      required: true,
    }));

    setVariables(newVariables);
    
    // Preserve existing values
    const newValues: Record<string, string> = {};
    extracted.forEach(key => {
      newValues[key] = values[key] || '';
    });
    setValues(newValues);
  }, [values]);

  const setValue = useCallback((key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
  }, []);

  const getCompletionPercentage = useCallback(() => {
    if (variables.length === 0) return 100;
    
    const filled = Object.values(values).filter(v => v.trim() !== '').length;
    return Math.round((filled / variables.length) * 100);
  }, [variables, values]);

  return {
    variables,
    values,
    parseContent,
    setValue,
    getCompletionPercentage,
    setVariables,
    setValues,
  };
}
