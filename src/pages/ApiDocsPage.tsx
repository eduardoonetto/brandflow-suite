import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Code, Copy, Check, FileText, Send, Users, Search, 
  Key, Shield, ArrowRight, Globe, Lock, Trash2, PenLine
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ENDPOINTS = [
  {
    method: 'POST',
    path: '/api/v1/auth/login',
    title: 'Autenticación',
    description: 'Obtener token de acceso con credenciales de API',
    category: 'auth',
    request: `{
  "api_key": "ak_live_xxxxx",
  "api_secret": "sk_live_xxxxx"
}`,
    response: `{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 3600
  }
}`,
  },
  {
    method: 'POST',
    path: '/api/v1/documents',
    title: 'Crear Documento',
    description: 'Crear un nuevo documento a partir de una plantilla o PDF',
    category: 'documents',
    request: `{
  "title": "Contrato de Trabajo 2025",
  "template_id": "tmpl-1",
  "variables": {
    "empresa_nombre": "Acme Corporation",
    "empleado_nombre": "Juan Pérez",
    "cargo": "Desarrollador Senior",
    "fecha_inicio": "2025-04-01"
  },
  "signers": [
    {
      "email": "juan@acme.com",
      "name": "Juan Pérez",
      "rut": "12.345.678-9",
      "signer_type": "signer",
      "signature_type": "pin",
      "order": 1
    },
    {
      "email": "gerente@acme.com",
      "name": "María García",
      "signer_type": "approver",
      "signature_type": "cedula",
      "order": 2
    }
  ],
  "tags": ["Contratos", "RRHH"]
}`,
    response: `{
  "success": true,
  "data": {
    "id": "doc-abc123",
    "title": "Contrato de Trabajo 2025",
    "status": "pending",
    "signers": [...],
    "created_at": "2025-03-06T10:00:00Z"
  }
}`,
  },
  {
    method: 'POST',
    path: '/api/v1/documents/upload',
    title: 'Subir PDF',
    description: 'Crear un documento subiendo un archivo PDF directamente',
    category: 'documents',
    request: `// multipart/form-data
{
  "file": "<PDF binary>",
  "title": "Documento Legal Firmado",
  "signers": [
    {
      "email": "firma@empresa.com",
      "name": "Carlos López",
      "signer_type": "signer",
      "signature_type": "pin",
      "order": 1
    }
  ]
}`,
    response: `{
  "success": true,
  "data": {
    "id": "doc-xyz789",
    "title": "Documento Legal Firmado",
    "status": "pending",
    "file_url": "https://storage.firma.cl/docs/...",
    "created_at": "2025-03-06T10:00:00Z"
  }
}`,
  },
  {
    method: 'GET',
    path: '/api/v1/documents',
    title: 'Listar Documentos',
    description: 'Obtener todos los documentos con filtros opcionales',
    category: 'documents',
    request: `// Query parameters
?status=pending&page=1&limit=20&search=contrato`,
    response: `{
  "success": true,
  "data": {
    "documents": [...],
    "total": 45,
    "page": 1,
    "limit": 20
  }
}`,
  },
  {
    method: 'GET',
    path: '/api/v1/documents/:id',
    title: 'Obtener Documento',
    description: 'Obtener detalles completos de un documento incluyendo firmantes y estado',
    category: 'documents',
    request: `// No body required`,
    response: `{
  "success": true,
  "data": {
    "id": "doc-abc123",
    "title": "Contrato de Trabajo 2025",
    "status": "pending",
    "content": "...",
    "signers": [
      {
        "id": "signer-1",
        "name": "Juan Pérez",
        "email": "juan@acme.com",
        "status": "signed",
        "signed_at": "2025-03-06T12:00:00Z"
      }
    ],
    "audit_trail": [...]
  }
}`,
  },
  {
    method: 'POST',
    path: '/api/v1/documents/:id/signers',
    title: 'Agregar Firmante',
    description: 'Agregar un nuevo firmante o visador a un documento existente (solo si no está completamente firmado)',
    category: 'documents',
    request: `{
  "email": "nuevo@empresa.com",
  "name": "Nuevo Firmante",
  "rut": "11.222.333-4",
  "signer_type": "signer",
  "signature_type": "pin",
  "order": 3
}`,
    response: `{
  "success": true,
  "data": {
    "id": "signer-new1",
    "document_id": "doc-abc123",
    "status": "pending"
  }
}`,
  },
  {
    method: 'POST',
    path: '/api/v1/documents/:id/trash',
    title: 'Enviar a Papelera',
    description: 'Enviar un documento a la papelera (solo el creador, solo si no está firmado por todas las partes)',
    category: 'documents',
    request: `{
  "reason": "Documento duplicado, se creará una nueva versión"
}`,
    response: `{
  "success": true,
  "data": {
    "id": "doc-abc123",
    "status": "trashed",
    "trashed_at": "2025-03-06T14:00:00Z"
  }
}`,
  },
  {
    method: 'GET',
    path: '/api/v1/templates',
    title: 'Listar Plantillas',
    description: 'Obtener todas las plantillas disponibles para crear documentos',
    category: 'templates',
    request: `// No body required`,
    response: `{
  "success": true,
  "data": [
    {
      "id": "tmpl-1",
      "title": "Contrato de Trabajo",
      "template_type": "template",
      "variables": [
        { "key": "empresa_nombre", "type": "text", "label": "Nombre de Empresa", "required": true }
      ]
    }
  ]
}`,
  },
  {
    method: 'GET',
    path: '/api/v1/documents/:id/audit',
    title: 'Traza de Auditoría',
    description: 'Obtener el historial completo de eventos del documento',
    category: 'audit',
    request: `// No body required`,
    response: `{
  "success": true,
  "data": [
    {
      "id": "evt-1",
      "type": "created",
      "timestamp": "2025-03-06T10:00:00Z",
      "actor_email": "admin@acme.com",
      "metadata": {}
    },
    {
      "id": "evt-2",
      "type": "signed",
      "timestamp": "2025-03-06T12:00:00Z",
      "actor_email": "juan@acme.com",
      "metadata": {
        "signer_name": "Juan Pérez",
        "signature_method": "pin",
        "ip_address": "192.168.1.10"
      }
    }
  ]
}`,
  },
  {
    method: 'POST',
    path: '/api/v1/webhooks',
    title: 'Configurar Webhook',
    description: 'Registrar un webhook para recibir notificaciones de eventos en documentos',
    category: 'webhooks',
    request: `{
  "url": "https://tu-servidor.com/webhook",
  "events": ["document.signed", "document.rejected", "document.trashed"],
  "secret": "whsec_xxxxx"
}`,
    response: `{
  "success": true,
  "data": {
    "id": "wh-1",
    "url": "https://tu-servidor.com/webhook",
    "events": ["document.signed", "document.rejected", "document.trashed"],
    "active": true
  }
}`,
  },
];

const methodColors: Record<string, string> = {
  GET: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
  POST: 'bg-blue-500/15 text-blue-600 border-blue-500/30',
  PUT: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
  DELETE: 'bg-red-500/15 text-red-600 border-red-500/30',
};

function CodeBlock({ code, language = 'json' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group">
      <pre className="bg-[#1e1e2e] text-[#cdd6f4] rounded-lg p-4 text-xs overflow-x-auto font-mono leading-relaxed">
        <code>{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded bg-white/10 hover:bg-white/20 text-white/60 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

export default function ApiDocsPage() {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { value: 'all', label: 'Todos', icon: Globe },
    { value: 'auth', label: 'Autenticación', icon: Key },
    { value: 'documents', label: 'Documentos', icon: FileText },
    { value: 'templates', label: 'Plantillas', icon: FileText },
    { value: 'audit', label: 'Auditoría', icon: Search },
    { value: 'webhooks', label: 'Webhooks', icon: Send },
  ];

  const filtered = activeCategory === 'all' 
    ? ENDPOINTS 
    : ENDPOINTS.filter(e => e.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1a1f36] via-[#1e2a4a] to-[#0f2027] text-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Code className="h-5 w-5" />
            </div>
            <Badge className="bg-white/10 text-white border-white/20">v1.0</Badge>
          </div>
          <h1 className="text-4xl font-bold mb-3">API de Firma Digital</h1>
          <p className="text-lg text-white/70 max-w-2xl">
            Integra la firma digital de documentos en tu aplicación. Crea documentos, gestiona firmantes 
            y recibe notificaciones de eventos en tiempo real.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg px-4 py-2 font-mono text-sm text-white/80">
              Base URL: https://api.firma.cl/api/v1
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Quick start */}
        <Card className="mb-8 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-primary" />
              Inicio Rápido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Para comenzar a usar la API, necesitas tus credenciales de acceso (API Key y Secret) 
              que puedes obtener en <strong>Configuración → API Keys</strong> de tu institución.
            </p>
            <CodeBlock code={`# 1. Obtener token de acceso
curl -X POST https://api.firma.cl/api/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"api_key": "ak_live_xxxxx", "api_secret": "sk_live_xxxxx"}'

# 2. Crear un documento
curl -X POST https://api.firma.cl/api/v1/documents \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Mi Contrato",
    "template_id": "tmpl-1",
    "variables": {"empresa_nombre": "Mi Empresa"},
    "signers": [{"email": "firma@ejemplo.com", "name": "Firmante", "signer_type": "signer", "signature_type": "pin", "order": 1}]
  }'`} />
            <div className="flex items-start gap-2 bg-primary/5 border border-primary/10 rounded-lg p-3">
              <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Autenticación:</strong> Todas las peticiones (excepto login) requieren 
                el header <code className="bg-muted px-1 rounded">Authorization: Bearer {'<token>'}</code>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(cat => (
            <Button
              key={cat.value}
              variant={activeCategory === cat.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(cat.value)}
              className="gap-1.5"
            >
              <cat.icon className="h-3.5 w-3.5" />
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Endpoints */}
        <div className="space-y-6">
          {filtered.map((endpoint, idx) => (
            <Card key={idx} id={endpoint.path.replace(/[/:]/g, '-')}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Badge className={cn('font-mono text-xs border', methodColors[endpoint.method])}>
                    {endpoint.method}
                  </Badge>
                  <code className="text-sm font-mono text-foreground">{endpoint.path}</code>
                </div>
                <CardTitle className="text-base mt-2">{endpoint.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{endpoint.description}</p>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="request" className="w-full">
                  <TabsList className="w-fit">
                    <TabsTrigger value="request" className="text-xs">Request</TabsTrigger>
                    <TabsTrigger value="response" className="text-xs">Response</TabsTrigger>
                  </TabsList>
                  <TabsContent value="request" className="mt-3">
                    <CodeBlock code={endpoint.request} />
                  </TabsContent>
                  <TabsContent value="response" className="mt-3">
                    <CodeBlock code={endpoint.response} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Rate limits */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Límites de Uso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="font-semibold">1,000</p>
                <p className="text-sm text-muted-foreground">Peticiones / hora</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="font-semibold">50 MB</p>
                <p className="text-sm text-muted-foreground">Tamaño máximo PDF</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="font-semibold">100</p>
                <p className="text-sm text-muted-foreground">Firmantes por documento</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
