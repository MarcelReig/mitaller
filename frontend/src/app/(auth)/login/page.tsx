'use client';

import type { Metadata } from 'next';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Ingresa un email válido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      // Llamar login y esperar el resultado
      const user = await login({ email: data.email, password: data.password });
      
      // Redirigir según el role del usuario
      if (user?.role === 'artisan') {
        console.log('Redirigiendo a dashboard artesano...');
        router.push('/artesano');
      } else if (user?.role === 'admin') {
        console.log('Redirigiendo a dashboard admin...');
        router.push('/artesano'); // Admins también van al dashboard
      } else {
        console.log('Redirigiendo al home...');
        router.push('/');
      }
    } catch (error) {
      // El hook ya muestra el toast de error
      console.error('Login error:', error);
      // No hacer nada más, el usuario permanece en el formulario
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Iniciar Sesión</h1>
        <p className="text-muted-foreground">
          Accede a tu cuenta de artesano
        </p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    autoComplete="email"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </Button>
        </form>
      </Form>

      {/* Link to Register */}
      <div className="text-center text-sm">
        <span className="text-muted-foreground">¿No tienes cuenta? </span>
        <Link
          href="/registro"
          className="font-medium text-primary hover:underline"
        >
          Regístrate aquí
        </Link>
      </div>
    </div>
  );
}
