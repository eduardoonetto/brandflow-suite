import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock, User, ArrowRight } from 'lucide-react';
import appLogo from '@/assets/app-logo.png';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    setError('');
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between overflow-hidden bg-gradient-to-br from-[#1a1f36] via-[#1e2a4a] to-[#0f2027]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-[#3b82f6]/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#06b6d4]/8 blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-[#8b5cf6]/6 blur-3xl" />
        </div>
        
        <div className="relative z-10 p-12 flex flex-col h-full justify-between">
          <div className="flex items-center gap-3">
            <img src={appLogo} alt="Logo" className="h-14 w-auto object-contain drop-shadow-lg" />
            <span className="text-xl font-bold text-white/90">Firma Digital</span>
          </div>
          
          <div className="max-w-md">
            <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
              Crea tu cuenta
            </h1>
            <p className="text-lg text-white/70">
              Regístrate y comienza a gestionar tus documentos de forma segura con firma digital.
            </p>
          </div>
          
          <div className="flex items-center gap-4 text-white/30 text-sm">
            <span>Powered by E-One SpA</span>
            <span>•</span>
            <a href="#" className="hover:text-white/50 transition-colors">Términos</a>
            <span>•</span>
            <a href="#" className="hover:text-white/50 transition-colors">Privacidad</a>
          </div>
        </div>
      </div>

      {/* Right side - Register form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex flex-col items-center justify-center gap-2 mb-8">
            <img src={appLogo} alt="Logo" className="h-14 w-auto object-contain" />
            <span className="text-xl font-bold text-foreground">Firma Digital</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Crear Cuenta</h2>
            <p className="text-muted-foreground">Complete los datos para registrarse</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="name" type="text" placeholder="Juan Pérez" value={name} onChange={(e) => setName(e.target.value)} className="pl-10 h-12 focus-visible:ring-[#2563eb] border-input" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="email" type="email" placeholder="nombre@empresa.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12 focus-visible:ring-[#2563eb] border-input" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 h-12" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10 h-12" required />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-[#1e3a5f] to-[#2563eb] hover:opacity-90 text-white"
              disabled={isLoading || !name || !email || !password || !confirmPassword}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Crear Cuenta
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            ¿Ya tiene una cuenta?{' '}
            <Link to="/login" className="text-[#2563eb] hover:underline font-medium">
              Iniciar Sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
