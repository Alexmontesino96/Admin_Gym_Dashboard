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
        hostname: 'gymapi-eh6m.onrender.com',
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
    // Ignorar errores de tipos en build (opcional)
    ignoreBuildErrors: false,
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
};

export default nextConfig;
