import React, { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, Bell, Shield, Palette, Globe, Key, Mail, Save, Check, Upload, Camera, Monitor
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const colorPresets = [
  { name: 'Azul', value: '220 80% 45%' },
  { name: 'Teal', value: '175 65% 42%' },
  { name: 'Púrpura', value: '280 70% 50%' },
  { name: 'Verde', value: '142 71% 45%' },
  { name: 'Naranja', value: '25 95% 53%' },
  { name: 'Rojo', value: '0 84% 60%' },
];

export default function Settings() {
  const { user, institution } = useAuth();
  const { theme, setTheme, sidebarThemes, currentSidebarTheme, setSidebarTheme } = useTheme();
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [notifications, setNotifications] = useState({
    emailOnSign: true,
    emailOnReject: true,
    emailDigest: false,
    browserPush: true,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        toast({ title: 'Archivo muy grande', description: 'La imagen no debe superar 1MB', variant: 'destructive' });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarUrl(event.target?.result as string);
        toast({ title: 'Foto actualizada', description: 'Tu foto de perfil ha sido cambiada' });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setIsSaved(true);
    toast({ title: 'Cambios guardados', description: 'Tu configuración ha sido actualizada' });
    setTimeout(() => setIsSaved(false), 2000);
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Administre su perfil y preferencias de la plataforma</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="profile" className="gap-2"><User className="h-4 w-4" /><span className="hidden sm:inline">Perfil</span></TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2"><Bell className="h-4 w-4" /><span className="hidden sm:inline">Notificaciones</span></TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2"><Palette className="h-4 w-4" /><span className="hidden sm:inline">Apariencia</span></TabsTrigger>
          <TabsTrigger value="security" className="gap-2"><Shield className="h-4 w-4" /><span className="hidden sm:inline">Seguridad</span></TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>Actualice su información de perfil</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    {avatarUrl ? <AvatarImage src={avatarUrl} alt="Avatar" /> : null}
                    <AvatarFallback className="text-2xl bg-gradient-primary text-primary-foreground">{getInitials(user?.name || '')}</AvatarFallback>
                  </Avatar>
                  <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                </div>
                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange} className="hidden" />
                <div>
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />Cambiar foto
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">JPG o PNG. Máximo 1MB.</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Nombre Completo</Label><Input defaultValue={user?.name} /></div>
                <div className="space-y-2"><Label>Correo Electrónico</Label><Input defaultValue={user?.email} type="email" /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Rol</Label><Input value={user?.role === 'admin' ? 'Administrador' : user?.role === 'superadmin' ? 'Super Admin' : 'Usuario'} disabled className="bg-muted" /></div>
                <div className="space-y-2"><Label>Institución</Label><Input value={institution?.name || ''} disabled className="bg-muted" /></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader><CardTitle>Preferencias de Notificación</CardTitle><CardDescription>Configure cómo desea recibir notificaciones</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              {[
                { key: 'emailOnSign', label: 'Documento firmado', desc: 'Recibir email cuando un documento sea firmado' },
                { key: 'emailOnReject', label: 'Documento rechazado', desc: 'Recibir email cuando un documento sea rechazado' },
                { key: 'emailDigest', label: 'Resumen diario', desc: 'Recibir un resumen diario de actividad por email' },
                { key: 'browserPush', label: 'Notificaciones push', desc: 'Recibir notificaciones en el navegador' },
              ].map(({ key, label, desc }) => (
                <React.Fragment key={key}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5"><Label>{label}</Label><p className="text-sm text-muted-foreground">{desc}</p></div>
                    <Switch checked={notifications[key as keyof typeof notifications]} onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, [key]: checked }))} />
                  </div>
                  <Separator />
                </React.Fragment>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Color Principal</CardTitle><CardDescription>Ajuste el color primario de la plataforma</CardDescription></CardHeader>
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
                          theme.primaryColor === color.value ? 'border-foreground scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                        )}
                        style={{ backgroundColor: `hsl(${color.value})` }}
                        title={color.name}
                      >
                        {theme.primaryColor === color.value && <Check className="h-5 w-5 mx-auto text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Vista previa</Label>
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `hsl(${theme.primaryColor})` }}>
                        <Mail className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">Ejemplo de documento</p>
                        <p className="text-sm text-muted-foreground">Así se verán los elementos destacados</p>
                      </div>
                    </div>
                    <Button className="w-full" style={{ background: `linear-gradient(135deg, hsl(${theme.primaryColor}) 0%, hsl(${theme.primaryColor.split(' ')[0]} 75% 55%) 100%)` }}>
                      Botón de acción
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Monitor className="h-5 w-5" />Tema del Menú Lateral</CardTitle>
                <CardDescription>Personaliza el color del sidebar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {sidebarThemes.map((st) => (
                    <button
                      key={st.name}
                      onClick={() => setSidebarTheme(st)}
                      className={cn(
                        'rounded-xl border-2 p-3 transition-all text-left',
                        currentSidebarTheme.name === st.name ? 'border-primary shadow-lg scale-[1.02]' : 'border-transparent hover:border-muted-foreground/30'
                      )}
                    >
                      <div 
                        className="h-16 rounded-lg mb-2 flex items-end p-2"
                        style={{ backgroundColor: `hsl(${st.sidebarBg})` }}
                      >
                        <div className="flex gap-1">
                          {[1,2,3].map(i => (
                            <div key={i} className="h-1.5 rounded-full" style={{ backgroundColor: `hsl(${st.sidebarFg})`, width: `${12 + i * 8}px`, opacity: 0.5 }} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm font-medium">{st.name}</p>
                      {currentSidebarTheme.name === st.name && (
                        <span className="text-xs text-primary">Activo</span>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader><CardTitle>Seguridad de la Cuenta</CardTitle><CardDescription>Administre su contraseña y configuración de seguridad</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2"><Label>Contraseña actual</Label><Input type="password" placeholder="••••••••" /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Nueva contraseña</Label><Input type="password" placeholder="••••••••" /></div>
                  <div className="space-y-2"><Label>Confirmar contraseña</Label><Input type="password" placeholder="••••••••" /></div>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5"><Label>Autenticación de dos factores</Label><p className="text-sm text-muted-foreground">Añada una capa extra de seguridad</p></div>
                <Button variant="outline"><Key className="h-4 w-4 mr-2" />Configurar</Button>
              </div>
              <Separator />
              <div>
                <Label className="text-sm text-muted-foreground">Sesiones activas</Label>
                <div className="mt-2 p-3 bg-muted/50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Este dispositivo</p>
                      <p className="text-xs text-muted-foreground">Chrome en macOS • Santiago, Chile</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-success/15 text-success rounded-full">Activo</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-gradient-primary hover:opacity-90">
          {isSaved ? <><Check className="h-4 w-4 mr-2" />Guardado</> : <><Save className="h-4 w-4 mr-2" />Guardar cambios</>}
        </Button>
      </div>
    </div>
  );
}
