/**
 * Debug Page para diagnosticar problemas de autenticación
 * Acceder en: /dashboard/debug-auth
 * 
 * 🔒 SOLO DISPONIBLE EN DESARROLLO
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { getToken, getRefreshToken } from '@/lib/axios';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DebugAuthPage() {
  const { user, isAuthenticated, isLoading, checkAuth } = useAuth();
  const router = useRouter();
  const [tokens, setTokens] = useState({ access: '', refresh: '' });
  const [logs, setLogs] = useState<string[]>([]);
  
  // 🔒 PROTECCIÓN: Solo disponible en desarrollo
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      router.replace('/dashboard');
    }
  }, [router]);
  
  useEffect(() => {
    const updateTokens = () => {
      const access = getToken();
      const refresh = getRefreshToken();
      setTokens({
        access: access ? `${access.substring(0, 30)}...` : 'NO TOKEN',
        refresh: refresh ? `${refresh.substring(0, 30)}...` : 'NO REFRESH TOKEN'
      });
    };
    
    updateTokens();
    const interval = setInterval(updateTokens, 1000);
    return () => clearInterval(interval);
  }, []);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const handleTestCheckAuth = async () => {
    addLog('Llamando checkAuth()...');
    await checkAuth();
    addLog('checkAuth() completado');
  };

  const handleTestNavigation = () => {
    addLog('Navegando a /dashboard/perfil...');
    router.push('/dashboard/perfil');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Debug de Autenticación</h1>
        <p className="text-muted-foreground mt-1">
          Información de debugging para diagnosticar problemas
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Estado de Autenticación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">isAuthenticated</label>
              <p className="text-base font-mono mt-1">
                {isAuthenticated ? (
                  <span className="text-green-600 font-bold">✓ true</span>
                ) : (
                  <span className="text-red-600 font-bold">✗ false</span>
                )}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">isLoading</label>
              <p className="text-base font-mono mt-1">
                {isLoading ? (
                  <span className="text-yellow-600 font-bold">⏳ true</span>
                ) : (
                  <span className="text-green-600 font-bold">✓ false</span>
                )}
              </p>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">User Object</label>
            <pre className="text-xs bg-muted p-4 rounded mt-2 overflow-auto max-h-60">
              {user ? JSON.stringify(user, null, 2) : 'null'}
            </pre>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Tokens JWT en Cookies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Access Token</label>
            <p className="text-xs font-mono break-all bg-muted p-2 rounded mt-1">
              {tokens.access}
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Refresh Token</label>
            <p className="text-xs font-mono break-all bg-muted p-2 rounded mt-1">
              {tokens.refresh}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Acciones de Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={handleTestCheckAuth} variant="outline">
              Test checkAuth()
            </Button>
            <Button onClick={handleTestNavigation} variant="outline">
              Test Navigation a Perfil
            </Button>
            <Button onClick={() => setLogs([])} variant="outline">
              Limpiar Logs
            </Button>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Logs Locales</label>
            <div className="text-xs bg-muted p-4 rounded mt-2 overflow-auto max-h-40 space-y-1">
              {logs.length === 0 ? (
                <p className="text-muted-foreground">No hay logs aún...</p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="font-mono">{log}</div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instrucciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm space-y-2">
            <p className="font-medium">Diagnóstico:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Si <code className="bg-muted px-1 rounded">isAuthenticated</code> es <strong>false</strong>: problema con autenticación</li>
              <li>Si <code className="bg-muted px-1 rounded">user</code> es <strong>null</strong>: usuario no cargado</li>
              <li>Si ves "NO TOKEN": no hay token en cookies</li>
              <li>Abre DevTools → Console y busca logs con <code className="bg-muted px-1 rounded">[AUTH]</code> y <code className="bg-muted px-1 rounded">[DASHBOARD LAYOUT]</code></li>
              <li>Si al hacer click en "Test Navigation a Perfil" te redirige a login, el problema está en el layout</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

