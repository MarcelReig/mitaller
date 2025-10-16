import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración de imágenes para Cloudinary y Django backend
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },

  // Features experimentales de Next.js 15
  experimental: {
    ppr: true, // Partial Prerendering
    reactCompiler: true, // React Compiler
  },

  // Variables de entorno públicas
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    NEXT_PUBLIC_STRIPE_PUBLIC_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || '',
  },
};

export default nextConfig;
