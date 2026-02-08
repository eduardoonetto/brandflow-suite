import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { authService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock, ArrowRight } from 'lucide-react';
import loginHero from '@/assets/login-hero.jpg';
import dec5Logo from '@/assets/dec5-logo.png';

export default function Login() {
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
      {/* Left side - Branding with AI image */}
      <div 
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-between overflow-hidden"
      >
        {/* Background image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${loginHero})` }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary/70" />
        
        {/* Content */}
        <div className="relative z-10 p-12 flex flex-col h-full justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={dec5Logo} 
              alt="DEC5 Logo" 
              className="h-12 w-auto object-contain bg-white/90 rounded-lg px-3 py-1"
            />
          </div>
          
          <div className="max-w-md">
            <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
              tuFirmaOK.cl
            </h1>
            <p className="text-2xl text-white/90 mb-2">
              Gestiona y firma documentos de manera segura
            </p>
            <p className="text-white/80 text-lg">
              Plataforma empresarial para la gestión de documentos digitales con 
              firmas electrónicas legalmente vinculantes.
            </p>
            
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <p className="text-2xl font-bold text-white">100%</p>
                <p className="text-sm text-white/70">Digital</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <p className="text-2xl font-bold text-white">24/7</p>
                <p className="text-sm text-white/70">Disponible</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <p className="text-2xl font-bold text-white">SSL</p>
                <p className="text-sm text-white/70">Seguro</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-white/50 text-sm">
            <span>© 2024 DEC5</span>
            <span>•</span>
            <a href="#" className="hover:text-white/70">Términos</a>
            <span>•</span>
            <a href="#" className="hover:text-white/70">Privacidad</a>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center justify-center gap-2 mb-8">
            <img 
              src={dec5Logo} 
              alt="DEC5 Logo" 
              className="h-12 w-auto object-contain"
            />
            <span className="text-xl font-bold text-primary">tuFirmaOK.cl</span>
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
            ¿No tiene una cuenta?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Registrarse
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
