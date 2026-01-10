import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimización para Vercel
  experimental: {
    // Configuración actualizada para Next.js 15
  },
  
  // Configuración de paquetes externos (actualizada para Next.js 15)
  serverExternalPackages: ['@auth0/nextjs-auth0'],
  
  // Configuración de imágenes
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.auth0.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.auth0.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's.gravatar.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.gravatar.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'gymapi-eh6m.onrender.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.example.com',
        port: '',
        pathname: '/**',
      },
      // Permitir dominios comunes para CDNs de imágenes
      {
        protocol: 'https',
        hostname: 'imgur.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      // Supabase Storage
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.in',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // Configuración de API routes con verificación de variable de entorno
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'https://gymapi-eh6m.onrender.com';
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },
  
  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Configuración de compilación
  typescript: {
    // Ignorar errores de tipos en build debido a bug en Next.js 15.5.9 con validator.ts
    // TODO: Revertir cuando se actualice a una versión sin este bug
    ignoreBuildErrors: true,
  },
  
  eslint: {
    // Ignorar errores de ESLint en build (opcional)
    ignoreDuringBuilds: false,
  },
  
  // Configuración de salida
  output: 'standalone',
  
  // Configuración de compresión
  compress: true,
  
  // Configuración de trailing slash
  trailingSlash: false,

  // Optimizaciones ligeras y seguras
  // swcMinify ya está habilitado por defecto en Next.js 15
  poweredByHeader: false, // Quitar header X-Powered-By
  
  // Optimización para desarrollo
  ...(process.env.NODE_ENV === 'development' && {
    webpack: (config) => {
      // Solo optimizaciones para desarrollo
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
      return config;
    },
  }),
};

export default nextConfig;
