import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { authService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { FileText, Loader2, Mail, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState('');
  
  const { login, isAuthenticated } = useAuth();
  const { setTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Detect institution from domain on mount
  useEffect(() => {
    const detectFromDomain = async () => {
      const hostname = window.location.hostname;
      if (hostname.includes('.')) {
        setIsDetecting(true);
        try {
          const response = await authService.detectInstitution(hostname);
          if (response.data) {
            setTheme({
              primaryColor: response.data.primaryColor,
              logoUrl: response.data.logoUrl,
              institutionName: response.data.name,
            });
          }
        } catch {
          // Ignore detection errors
        }
        setIsDetecting(false);
      }
    };
    
    detectFromDomain();
  }, [setTheme]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError('');

    // Try to detect institution from email domain
    const domain = email.split('@')[1];
    if (domain) {
      try {
        const response = await authService.detectInstitution(domain);
        if (response.data) {
          setTheme({
            primaryColor: response.data.primaryColor,
            logoUrl: response.data.logoUrl,
            institutionName: response.data.name,
          });
        }
      } catch {
        // Continue without branding
      }
    }

    setIsLoading(false);
    setStep('password');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Credenciales inválidas. Por favor intente de nuevo.');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-white">SignFlow</span>
        </div>
        
        <div className="max-w-md">
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Gestiona y firma documentos de manera segura
          </h1>
          <p className="text-white/70 text-lg">
            Plataforma empresarial para la gestión de documentos digitales con 
            firmas electrónicas legalmente vinculantes.
          </p>
        </div>
        
        <div className="flex items-center gap-4 text-white/50 text-sm">
          <span>© 2024 SignFlow</span>
          <span>•</span>
          <a href="#" className="hover:text-white/70">Términos</a>
          <span>•</span>
          <a href="#" className="hover:text-white/70">Privacidad</a>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">SignFlow</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">
              {step === 'email' ? 'Iniciar Sesión' : 'Ingrese su contraseña'}
            </h2>
            <p className="text-muted-foreground">
              {step === 'email' 
                ? 'Ingrese su correo electrónico para continuar'
                : `Iniciando sesión como ${email}`
              }
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              {error}
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nombre@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12"
                    autoFocus
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-primary hover:opacity-90"
                disabled={isLoading || !email}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Continuar
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12"
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-primary hover:underline"
                >
                  Usar otro correo
                </button>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  ¿Olvidó su contraseña?
                </a>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-primary hover:opacity-90"
                disabled={isLoading || !password}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Iniciar Sesión
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </Button>
            </form>
          )}

          <p className="mt-8 text-center text-sm text-muted-foreground">
            ¿Necesita una cuenta?{' '}
            <a href="#" className="text-primary hover:underline font-medium">
              Contacte a su administrador
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
