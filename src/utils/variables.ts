// Helper function to extract variables from document content
export function extractVariables(content: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const matches: string[] = [];
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const varName = match[1].trim();
    if (!matches.includes(varName)) {
      matches.push(varName);
    }
  }
  
  return matches;
}

// Replace variables in content with their values
export function replaceVariables(
  content: string, 
  variables: Record<string, string>
): string {
  let result = content;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
    result = result.replace(regex, value || `{{${key}}}`);
  });
  
  return result;
}

// Highlight unreplaced variables in content
export function highlightVariables(content: string): string {
  return content.replace(
    /\{\{([^}]+)\}\}/g,
    '<span class="bg-warning/20 text-warning px-1 rounded font-medium">{{$1}}</span>'
  );
}

// Infer variable type from name
export function inferVariableType(name: string): 'text' | 'date' | 'number' | 'select' {
  const nameLower = name.toLowerCase();
  
  if (nameLower.includes('fecha') || nameLower.includes('date')) {
    return 'date';
  }
  
  if (
    nameLower.includes('monto') || 
    nameLower.includes('cantidad') || 
    nameLower.includes('total') ||
    nameLower.includes('precio') ||
    nameLower.includes('amount') ||
    nameLower.includes('number')
  ) {
    return 'number';
  }
  
  return 'text';
}

// Generate label from variable key
export function generateLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim();
}
