# 🚀 Guía de Despliegue en Vercel

Esta guía te ayudará a desplegar el Gym Admin Dashboard en Vercel paso a paso.

## ✅ Lista de Verificación Pre-Despliegue

Antes de desplegar, ejecuta el script de verificación:

```bash
npm run deploy:check
```

Este comando ejecutará:
- Linter (ESLint)
- Verificación de tipos (TypeScript)
- Verificación de configuración pre-despliegue

## 🔧 Configuración Requerida

### 1. Variables de Entorno

Necesitarás configurar las siguientes variables de entorno en Vercel:

#### Auth0 (Obligatorias)
```env
AUTH0_SECRET=your-32-character-secret-key
AUTH0_BASE_URL=https://your-app.vercel.app
AUTH0_ISSUER_BASE_URL=https://your-auth0-domain.auth0.com
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret
```

#### Backend API (Obligatorias)
```env
BACKEND_URL=https://gymapi-eh6m.onrender.com
NEXT_PUBLIC_BACKEND_URL=https://gymapi-eh6m.onrender.com
```

#### Stream Chat (Opcional)
```env
STREAM_API_KEY=your-stream-api-key
STREAM_API_SECRET=your-stream-api-secret
```

### 2. Configuración de Auth0

En tu aplicación Auth0, configura:

#### Allowed Callback URLs
```
http://localhost:3000/api/auth/callback,https://your-app.vercel.app/api/auth/callback
```

#### Allowed Logout URLs
```
http://localhost:3000/,https://your-app.vercel.app/
```

#### Allowed Web Origins
```
http://localhost:3000,https://your-app.vercel.app
```

## 🚀 Métodos de Despliegue

### Método 1: Despliegue Automático (Recomendado)

1. **Conecta tu repositorio a Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Haz clic en "New Project"
   - Conecta tu repositorio
   - Selecciona el directorio `gym-admin-nextjs`

2. **Configura las variables de entorno**
   - Ve a Project Settings > Environment Variables
   - Agrega todas las variables listadas arriba

3. **Configura el dominio personalizado** (opcional)
   - Ve a Project Settings > Domains
   - Agrega tu dominio personalizado

4. **Despliega**
   - Vercel desplegará automáticamente
   - Cada push a main activará un nuevo despliegue

### Método 2: Despliegue con CLI

1. **Instala Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Inicia sesión**
   ```bash
   vercel login
   ```

3. **Despliega**
   ```bash
   cd gym-admin-nextjs
   vercel
   ```

4. **Configura variables de entorno**
   ```bash
   vercel env add AUTH0_SECRET
   vercel env add AUTH0_BASE_URL
   vercel env add AUTH0_ISSUER_BASE_URL
   vercel env add AUTH0_CLIENT_ID
   vercel env add AUTH0_CLIENT_SECRET
   vercel env add BACKEND_URL
   vercel env add NEXT_PUBLIC_BACKEND_URL
   ```

5. **Despliega a producción**
   ```bash
   vercel --prod
   ```

## 🔍 Verificación Post-Despliegue

Después del despliegue, verifica:

1. **Autenticación**
   - ✅ Login funciona correctamente
   - ✅ Logout funciona correctamente
   - ✅ Redirecciones funcionan

2. **API Backend**
   - ✅ Conexión al backend exitosa
   - ✅ Datos se cargan correctamente
   - ✅ Operaciones CRUD funcionan

3. **Funcionalidades**
   - ✅ Dashboard muestra datos
   - ✅ Navegación funciona
   - ✅ Chat funciona (si está configurado)
   - ✅ Formularios funcionan

## 🐛 Solución de Problemas Comunes

### Error: "Invalid state parameter"
**Causa**: Configuración incorrecta de Auth0
**Solución**: 
- Verifica que `AUTH0_BASE_URL` sea exactamente tu URL de Vercel
- Asegúrate de que las URLs en Auth0 coincidan exactamente

### Error: "Failed to fetch"
**Causa**: Problema con la conexión al backend
**Solución**:
- Verifica que `BACKEND_URL` y `NEXT_PUBLIC_BACKEND_URL` sean correctas
- Comprueba que el backend esté funcionando
- Revisa los CORS en el backend

### Error: "Build failed"
**Causa**: Errores de TypeScript o ESLint
**Solución**:
- Ejecuta `npm run deploy:check` localmente
- Corrige los errores reportados
- Haz commit y push de los cambios

### Error: "Environment variables not found"
**Causa**: Variables de entorno no configuradas
**Solución**:
- Ve a Vercel Dashboard > Project Settings > Environment Variables
- Agrega todas las variables requeridas
- Redespliega el proyecto

## 📈 Optimizaciones de Rendimiento

### 1. Configuración de Next.js
- ✅ Output standalone habilitado
- ✅ Compresión habilitada
- ✅ Optimización de imágenes configurada
- ✅ Headers de seguridad configurados

### 2. Configuración de Vercel
- ✅ Funciones optimizadas (30s timeout)
- ✅ Rutas configuradas correctamente
- ✅ Build cache habilitado

### 3. Monitoreo
- Usa Vercel Analytics para monitorear rendimiento
- Configura alertas para errores
- Revisa logs regularmente

## 🔄 Actualizaciones

### Despliegue Automático
- Cada push a `main` despliega automáticamente
- Usa branches para features y merge via PR

### Despliegue Manual
```bash
# Actualizar código
git pull origin main

# Verificar cambios
npm run deploy:check

# Desplegar
vercel --prod
```

## 📞 Soporte

Si encuentras problemas:

1. **Revisa los logs de Vercel**
   - Ve a tu proyecto en Vercel
   - Navega a la pestaña "Functions"
   - Revisa los logs de errores

2. **Verifica la configuración**
   - Ejecuta `npm run pre-deploy`
   - Revisa que todas las variables estén configuradas

3. **Contacta al equipo de desarrollo**
   - Proporciona los logs de error
   - Incluye la configuración (sin secretos)
   - Describe los pasos que llevaron al error

## 🎉 ¡Listo!

Tu aplicación debería estar funcionando en Vercel. Recuerda:

- Mantén las variables de entorno seguras
- Actualiza Auth0 cuando cambies dominios
- Monitorea el rendimiento regularmente
- Mantén el código actualizado 