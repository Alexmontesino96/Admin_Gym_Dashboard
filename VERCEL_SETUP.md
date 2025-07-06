# ⚡ Configuración Rápida para Vercel

## 🎯 Resumen de Archivos Creados/Modificados

### Archivos de Configuración
- ✅ `vercel.json` - Configuración principal de Vercel
- ✅ `next.config.ts` - Configuración optimizada de Next.js
- ✅ `env.example` - Ejemplo de variables de entorno
- ✅ `package.json` - Scripts optimizados para despliegue
- ✅ `.gitignore` - Archivos ignorados actualizados

### Scripts y Documentación
- ✅ `scripts/pre-deploy.js` - Script de verificación
- ✅ `README.md` - Documentación completa
- ✅ `DEPLOYMENT.md` - Guía detallada de despliegue
- ✅ `VERCEL_SETUP.md` - Este archivo

## 🚀 Configuración Rápida (5 minutos)

### 1. Conectar a Vercel
```bash
# Opción A: Interfaz web
# Ve a vercel.com → New Project → Conecta tu repo

# Opción B: CLI
npm install -g vercel
vercel login
vercel
```

### 2. Variables de Entorno (Críticas)
```env
# Auth0 - OBLIGATORIAS
AUTH0_SECRET=tu-secreto-de-32-caracteres
AUTH0_BASE_URL=https://tu-app.vercel.app
AUTH0_ISSUER_BASE_URL=https://tu-dominio.auth0.com
AUTH0_CLIENT_ID=tu-client-id
AUTH0_CLIENT_SECRET=tu-client-secret

# Backend - OBLIGATORIAS
BACKEND_URL=https://gymapi-eh6m.onrender.com
NEXT_PUBLIC_BACKEND_URL=https://gymapi-eh6m.onrender.com
```

### 3. Configurar Auth0
En tu aplicación Auth0:
- **Allowed Callback URLs**: `https://tu-app.vercel.app/api/auth/callback`
- **Allowed Logout URLs**: `https://tu-app.vercel.app/`
- **Allowed Web Origins**: `https://tu-app.vercel.app`

### 4. Verificar Configuración
```bash
npm run deploy:check
```

## ✅ Checklist de Despliegue

### Antes del Despliegue
- [ ] Repositorio conectado a Vercel
- [ ] Variables de entorno configuradas
- [ ] Auth0 configurado con URLs correctas
- [ ] Script de verificación ejecutado sin errores

### Después del Despliegue
- [ ] Login funciona
- [ ] Dashboard carga datos
- [ ] Navegación funciona
- [ ] API backend conectada
- [ ] Chat funciona (si está configurado)

## 🔧 Configuración Avanzada

### Optimizaciones Incluidas
- **Next.js**: Output standalone, compresión, headers de seguridad
- **Vercel**: Funciones optimizadas, rutas configuradas, cache habilitado
- **Images**: Dominios permitidos configurados
- **API**: Proxy al backend configurado

### Monitoreo
- Usa Vercel Analytics
- Configura alertas de errores
- Revisa logs regularmente

## 🐛 Solución Rápida de Problemas

| Error | Causa | Solución |
|-------|-------|----------|
| "Invalid state parameter" | Auth0 mal configurado | Verifica URLs en Auth0 |
| "Failed to fetch" | Backend no conecta | Verifica BACKEND_URL |
| "Build failed" | Errores de código | Ejecuta `npm run deploy:check` |
| "Env vars not found" | Variables faltantes | Agrega en Vercel Settings |

## 📞 Soporte Rápido

1. **Logs de Vercel**: Project → Functions → View logs
2. **Verificación local**: `npm run deploy:check`
3. **Documentación completa**: Ver `DEPLOYMENT.md`

## 🎉 ¡Listo para Desplegar!

Tu proyecto está completamente configurado para Vercel. Solo necesitas:
1. Conectar tu repositorio
2. Configurar las variables de entorno
3. Actualizar Auth0
4. ¡Disfrutar tu aplicación en producción!

---

**Tiempo estimado de despliegue**: 5-10 minutos
**Dificultad**: Fácil
**Requisitos**: Cuenta en Vercel y Auth0 