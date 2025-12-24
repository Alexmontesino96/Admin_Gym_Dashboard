# Configuración de Auth0

Este documento explica cómo configurar Auth0 correctamente para que el sistema funcione tanto en desarrollo como en producción (Vercel).

## Variables de Entorno Requeridas

### Desarrollo (`.env.local`)

```env
# Auth0 Configuration
AUTH0_SECRET=your-secret-key-at-least-32-characters-long
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://dev-gd5crfe6qbqlu23p.us.auth0.com
AUTH0_CLIENT_ID=OuJ6IKE0lJSdaMG6jaW04jfptsMRbyvp
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_AUDIENCE=https://gymapi-eh6m.onrender.com

# Application URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Producción (Vercel Environment Variables)

En Vercel, configura las siguientes variables:

```env
AUTH0_SECRET=your-production-secret-key-at-least-32-characters-long
AUTH0_BASE_URL=https://admin-gym-dashboard.vercel.app
AUTH0_ISSUER_BASE_URL=https://dev-gd5crfe6qbqlu23p.us.auth0.com
AUTH0_CLIENT_ID=OuJ6IKE0lJSdaMG6jaW04jfptsMRbyvp
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_AUDIENCE=https://gymapi-eh6m.onrender.com
NEXT_PUBLIC_BASE_URL=https://admin-gym-dashboard.vercel.app
```

> **Nota**: `AUTH0_BASE_URL` debe coincidir con la URL de tu aplicación.

## Configuración en el Dashboard de Auth0

### 1. Application Settings

Ve a **Applications > gym-admin-nextjs > Settings** y configura:

#### Allowed Callback URLs
Agrega ambas URLs (desarrollo y producción):
```
http://localhost:3000/api/auth/callback,
https://admin-gym-dashboard.vercel.app/api/auth/callback
```

#### Allowed Logout URLs
**MUY IMPORTANTE**: Agrega ambas URLs base:
```
http://localhost:3000,
https://admin-gym-dashboard.vercel.app
```

#### Allowed Web Origins
```
http://localhost:3000,
https://admin-gym-dashboard.vercel.app
```

### 2. API Configuration

Ve a **Applications > APIs > Gym Management API** y verifica:

- **Identifier**: `https://gymapi-eh6m.onrender.com`
- **Signing Algorithm**: RS256

## Verificación de Configuración

### 1. Verificar que las URLs estén correctamente configuradas

```bash
# En desarrollo
curl http://localhost:3000/api/auth/me

# En producción
curl https://admin-gym-dashboard.vercel.app/api/auth/me
```

### 2. Probar el flujo de login/logout

1. **Login**:
   - Debe redirigir a Auth0
   - Debe volver a `/api/auth/callback`
   - Debe redirigir a `/dashboard` o `/select-gym`

2. **Logout**:
   - Debe limpiar el contexto del usuario
   - Debe redirigir a Auth0 logout
   - Debe volver a la raíz de la aplicación

### 3. Logs útiles

El sistema incluye logs en la consola del servidor:

```typescript
// En /api/auth/logout
console.log('Logout - returnTo URL:', returnTo)
```

Verifica en los logs de Vercel que la URL de returnTo sea correcta.

## Problemas Comunes

### Error: "Oops!, something went wrong" en Auth0 Logout

**Causa**: La URL de `returnTo` no está en las "Allowed Logout URLs" de Auth0.

**Solución**:
1. Ve a Auth0 Dashboard > Applications > Settings
2. Agrega `https://admin-gym-dashboard.vercel.app` a "Allowed Logout URLs"
3. Guarda los cambios
4. Espera ~30 segundos para que los cambios se propaguen

### Error: "The redirect URI is wrong"

**Causa**: La URL de callback no está en "Allowed Callback URLs".

**Solución**:
1. Verifica que `AUTH0_BASE_URL` esté correctamente configurado en Vercel
2. Agrega la URL completa de callback en Auth0 Dashboard

### Token sin audience

**Causa**: `AUTH0_AUDIENCE` no está configurado.

**Solución**:
1. Configura `AUTH0_AUDIENCE=https://gymapi-eh6m.onrender.com` en Vercel
2. Redeploya la aplicación

## Generación de AUTH0_SECRET

El `AUTH0_SECRET` debe ser una cadena aleatoria de al menos 32 caracteres. Puedes generarlo así:

```bash
# En macOS/Linux
openssl rand -base64 32

# O en Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Troubleshooting en Vercel

1. **Ver logs de la aplicación**:
   - Ve a Vercel Dashboard > tu proyecto > Deployments
   - Click en el deployment activo > Runtime Logs

2. **Ver variables de entorno**:
   - Ve a Settings > Environment Variables
   - Verifica que todas las variables estén configuradas

3. **Redeployar después de cambios**:
   - Los cambios en variables de entorno requieren un nuevo deployment
   - Ve a Deployments > Redeploy

## Referencias

- [Auth0 Next.js Quickstart](https://auth0.com/docs/quickstart/webapp/nextjs)
- [Auth0 SDK for Next.js](https://github.com/auth0/nextjs-auth0)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
