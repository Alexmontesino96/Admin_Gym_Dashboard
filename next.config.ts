import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimización para Vercel
  experimental: {
    // Habilitar Server Components
    serverComponentsExternalPackages: ['@auth0/nextjs-auth0'],
  },
  
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
  
  // Configuración de API routes
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.BACKEND_URL}/api/v1/:path*`,
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
