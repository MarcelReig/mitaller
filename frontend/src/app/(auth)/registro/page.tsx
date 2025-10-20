'use client';

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
import { toast } from 'sonner';

const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
      .max(20, 'Máximo 20 caracteres')
      .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guiones bajos'),
    email: z
      .string()
      .min(1, 'El email es requerido')
      .email('Ingresa un email válido'),
    password: z
      .string()
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .max(100, 'Máximo 100 caracteres'),
    password_confirm: z.string().min(1, 'Confirma tu contraseña'),
    first_name: z
      .string()
      .min(2, 'Mínimo 2 caracteres')
      .optional()
      .or(z.literal('')),
    last_name: z
      .string()
      .min(2, 'Mínimo 2 caracteres')
      .optional()
      .or(z.literal('')),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['password_confirm'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register, isLoading } = useAuth();
  const router = useRouter();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      password_confirm: '',
      first_name: '',
      last_name: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await register({
        username: data.username,
        email: data.email,
        password: data.password,
        first_name: data.first_name || '',
        last_name: data.last_name || '',
      });

      // Éxito: mostrar toast y redirigir a login
      toast.success('Cuenta creada exitosamente. Ahora inicia sesión.');
      router.push('/login');
    } catch (error) {
      // El hook ya muestra el toast de error
      console.error('Register error:', error);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Crear Cuenta</h1>
        <p className="text-muted-foreground">
          Únete a la comunidad de artesanos
        </p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Username Field */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de usuario *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="usuario123"
                    autoComplete="username"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
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

          {/* First Name Field */}
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre (opcional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Juan"
                    autoComplete="given-name"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Last Name Field */}
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellidos (opcional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Pérez"
                    autoComplete="family-name"
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
                <FormLabel>Contraseña *</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Confirm Field */}
          <FormField
            control={form.control}
            name="password_confirm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar contraseña *</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
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
                Creando cuenta...
              </>
            ) : (
              'Crear Cuenta'
            )}
          </Button>
        </form>
      </Form>

      {/* Link to Login */}
      <div className="text-center text-sm">
        <span className="text-muted-foreground">¿Ya tienes cuenta? </span>
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          Inicia sesión
        </Link>
      </div>
    </div>
  );
}
