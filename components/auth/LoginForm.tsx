'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth';
import { useLanguage } from '@/components/LanguageProvider';
import { ThemeToggle } from '@/components/ThemeSwitcher';
import { Shield, Eye, EyeOff } from 'lucide-react';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const user = login(username, password);
      if (user) {
        // Store user in localStorage for persistence
        localStorage.setItem('bdo_user', JSON.stringify(user));
        router.push('/dashboard');
      } else {
        setError(t.auth.invalidCredentials);
      }
    } catch (err) {
      setError(t.auth.loginFailed);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-foreground">
            {t.auth.title}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t.auth.subtitle}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-foreground">
                {t.auth.username}
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                placeholder={t.auth.username}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                {t.auth.password}
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 pr-10 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder={t.auth.password}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/20 border border-destructive/50 text-destructive-foreground px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? t.auth.loggingIn : t.auth.login}
          </button>
        </form>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            {t.auth.defaultCredentials}
          </p>
        </div>
      </div>
    </div>
  );
}
