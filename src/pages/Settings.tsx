import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe,
  Key,
  Mail,
  Save,
  Check,
  Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';

const colorPresets = [
  { name: 'Azul', value: '220 80% 45%' },
  { name: 'Teal', value: '175 65% 42%' },
  { name: 'Púrpura', value: '280 70% 50%' },
  { name: 'Verde', value: '142 71% 45%' },
  { name: 'Naranja', value: '25 95% 53%' },
];

export default function Settings() {
  const { user, institution } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isSaved, setIsSaved] = useState(false);

  const [notifications, setNotifications] = useState({
    emailOnSign: true,
    emailOnReject: true,
    emailDigest: false,
    browserPush: true,
  });

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">
          Administre su perfil y preferencias de la plataforma
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            Apariencia
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Seguridad
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>
                Actualice su información de perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-full bg-gradient-primary flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-foreground">
                    {user?.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Cambiar foto
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG o PNG. Máximo 1MB.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre Completo</Label>
                  <Input defaultValue={user?.name} />
                </div>
                <div className="space-y-2">
                  <Label>Correo Electrónico</Label>
                  <Input defaultValue={user?.email} type="email" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rol</Label>
                  <Input 
                    value={user?.role === 'admin' ? 'Administrador' : 'Usuario'} 
                    disabled 
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Institución</Label>
                  <Input 
                    value={institution?.name || ''} 
                    disabled 
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Departamentos</Label>
                <div className="flex flex-wrap gap-2">
                  {user?.departmentRoles.map(role => (
                    <span
                      key={role}
                      className="px-3 py-1 bg-muted rounded-full text-sm"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de Notificación</CardTitle>
              <CardDescription>
                Configure cómo desea recibir notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Documento firmado</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibir email cuando un documento sea firmado
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.emailOnSign}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, emailOnSign: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Documento rechazado</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibir email cuando un documento sea rechazado
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.emailOnReject}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, emailOnReject: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Resumen diario</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibir un resumen diario de actividad por email
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.emailDigest}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, emailDigest: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificaciones push</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibir notificaciones en el navegador
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.browserPush}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, browserPush: checked }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Personalización Visual</CardTitle>
              <CardDescription>
                Ajuste la apariencia de la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Color principal</Label>
                <div className="flex flex-wrap gap-3">
                  {colorPresets.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setTheme({ primaryColor: color.value })}
                      className={cn(
                        'h-12 w-12 rounded-xl border-2 transition-all',
                        theme.primaryColor === color.value 
                          ? 'border-foreground scale-110 shadow-lg' 
                          : 'border-transparent hover:scale-105'
                      )}
                      style={{ backgroundColor: `hsl(${color.value})` }}
                      title={color.name}
                    >
                      {theme.primaryColor === color.value && (
                        <Check className="h-5 w-5 mx-auto text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Vista previa</Label>
                <div className="p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className="h-10 w-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `hsl(${theme.primaryColor})` }}
                    >
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Ejemplo de documento</p>
                      <p className="text-sm text-muted-foreground">
                        Así se verán los elementos destacados
                      </p>
                    </div>
                  </div>
                  <Button 
                    className="w-full"
                    style={{ 
                      background: `linear-gradient(135deg, hsl(${theme.primaryColor}) 0%, hsl(${theme.primaryColor.split(' ')[0]} 75% 55%) 100%)` 
                    }}
                  >
                    Botón de acción
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Seguridad de la Cuenta</CardTitle>
              <CardDescription>
                Administre su contraseña y configuración de seguridad
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Contraseña actual</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nueva contraseña</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirmar contraseña</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Autenticación de dos factores</Label>
                  <p className="text-sm text-muted-foreground">
                    Añada una capa extra de seguridad a su cuenta
                  </p>
                </div>
                <Button variant="outline">
                  <Key className="h-4 w-4 mr-2" />
                  Configurar
                </Button>
              </div>

              <Separator />

              <div>
                <Label className="text-sm text-muted-foreground">
                  Sesiones activas
                </Label>
                <div className="mt-2 p-3 bg-muted/50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Este dispositivo</p>
                      <p className="text-xs text-muted-foreground">
                        Chrome en macOS • Santiago, Chile
                      </p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-success/15 text-success rounded-full">
                    Activo
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          className="bg-gradient-primary hover:opacity-90"
        >
          {isSaved ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Guardado
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar cambios
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
