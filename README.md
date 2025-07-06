# Gym Admin Dashboard - Next.js

Panel de administración moderno para gimnasios construido con Next.js 15, TypeScript, Tailwind CSS y Auth0.

## 🚀 Características

- **Autenticación**: Integración completa con Auth0
- **Dashboard**: Estadísticas y métricas en tiempo real
- **Gestión de Usuarios**: Administración de miembros y entrenadores
- **Sistema de Chat**: Chat en tiempo real estilo Messenger con Stream Chat
- **Nutrición**: Gestión de planes nutricionales
- **Horarios**: Programación de clases y sesiones
- **Eventos**: Gestión de eventos del gimnasio
- **Diseño Responsivo**: Interfaz moderna con Tailwind CSS

## 🛠️ Tecnologías

- **Frontend**: Next.js 15, React 19, TypeScript
- **Estilos**: Tailwind CSS
- **Autenticación**: Auth0
- **Chat**: Stream Chat
- **Iconos**: Lucide React
- **Gráficos**: Recharts

## 📦 Instalación

1. Clona el repositorio:
```bash
git clone <repository-url>
cd gym-admin-nextjs
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
cp env.example .env.local
```

4. Configura las variables en `.env.local`:
```env
# Auth0 Configuration
AUTH0_SECRET=your-auth0-secret-here
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-auth0-domain.auth0.com
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret

# Backend API Configuration
BACKEND_URL=https://gymapi-eh6m.onrender.com
NEXT_PUBLIC_BACKEND_URL=https://gymapi-eh6m.onrender.com
```

5. Ejecuta el servidor de desarrollo:
```bash
npm run dev
```

## 🚀 Despliegue en Vercel

### Opción 1: Despliegue Automático (Recomendado)

1. **Conecta tu repositorio a Vercel**:
   - Ve a [vercel.com](https://vercel.com)
   - Haz clic en "New Project"
   - Conecta tu repositorio de GitHub/GitLab/Bitbucket
   - Selecciona el directorio `gym-admin-nextjs`

2. **Configura las variables de entorno en Vercel**:
   - Ve a tu proyecto en Vercel Dashboard
   - Navega a Settings > Environment Variables
   - Agrega las siguientes variables:

   ```
   AUTH0_SECRET=your-auth0-secret-here
   AUTH0_BASE_URL=https://your-app.vercel.app
   AUTH0_ISSUER_BASE_URL=https://your-auth0-domain.auth0.com
   AUTH0_CLIENT_ID=your-auth0-client-id
   AUTH0_CLIENT_SECRET=your-auth0-client-secret
   BACKEND_URL=https://gymapi-eh6m.onrender.com
   NEXT_PUBLIC_BACKEND_URL=https://gymapi-eh6m.onrender.com
   ```

3. **Configura Auth0**:
   - En tu aplicación Auth0, agrega las siguientes URLs:
   - **Allowed Callback URLs**: `https://your-app.vercel.app/api/auth/callback`
   - **Allowed Logout URLs**: `https://your-app.vercel.app/`
   - **Allowed Web Origins**: `https://your-app.vercel.app`

4. **Despliega**:
   - Vercel desplegará automáticamente tu aplicación
   - Cada push a la rama principal activará un nuevo despliegue

### Opción 2: Despliegue Manual con Vercel CLI

1. **Instala Vercel CLI**:
```bash
npm install -g vercel
```

2. **Inicia sesión en Vercel**:
```bash
vercel login
```

3. **Despliega el proyecto**:
```bash
cd gym-admin-nextjs
vercel
```

4. **Configura las variables de entorno**:
```bash
vercel env add AUTH0_SECRET
vercel env add AUTH0_BASE_URL
vercel env add AUTH0_ISSUER_BASE_URL
vercel env add AUTH0_CLIENT_ID
vercel env add AUTH0_CLIENT_SECRET
vercel env add BACKEND_URL
vercel env add NEXT_PUBLIC_BACKEND_URL
```

5. **Despliega a producción**:
```bash
vercel --prod
```

## 🔧 Configuración Adicional

### Auth0 Setup

1. **Crea una aplicación en Auth0**:
   - Tipo: Regular Web Application
   - Tecnología: Next.js

2. **Configura las URLs permitidas**:
   - **Allowed Callback URLs**: `http://localhost:3000/api/auth/callback`, `https://your-app.vercel.app/api/auth/callback`
   - **Allowed Logout URLs**: `http://localhost:3000/`, `https://your-app.vercel.app/`
   - **Allowed Web Origins**: `http://localhost:3000`, `https://your-app.vercel.app`

3. **Configura los roles y permisos** según tu backend API.

### Backend API

El proyecto está configurado para usar la API backend en `https://gymapi-eh6m.onrender.com`. Asegúrate de que:

1. La API backend esté desplegada y funcionando
2. Los endpoints de autenticación estén configurados
3. Los CORS estén habilitados para tu dominio de Vercel

## 📱 Funcionalidades Principales

### Dashboard
- Estadísticas de miembros, entrenamientos y ingresos
- Gráficos interactivos con Recharts
- Acciones rápidas y actividad reciente

### Gestión de Usuarios
- Lista de miembros con filtros avanzados
- Perfiles detallados de usuarios
- Gestión de roles y permisos

### Sistema de Chat
- Interfaz estilo Messenger
- Conversaciones en tiempo real
- Creación de salas grupales
- Integración con Stream Chat

### Nutrición
- Creación de planes nutricionales
- Gestión de macronutrientes
- Filtros por objetivo y dificultad
- Sistema de etiquetas

### Horarios
- Programación de clases
- Gestión de categorías
- Calendarios interactivos
- Días especiales y excepciones

## 🐛 Solución de Problemas

### Error de Autenticación
- Verifica que las variables de entorno de Auth0 estén configuradas correctamente
- Asegúrate de que las URLs permitidas en Auth0 incluyan tu dominio de Vercel

### Error de API
- Verifica que `BACKEND_URL` y `NEXT_PUBLIC_BACKEND_URL` apunten a tu API backend
- Comprueba que la API backend esté funcionando

### Error de Build
- Ejecuta `npm run build` localmente para identificar errores
- Revisa los logs de Vercel para más detalles

## 📄 Licencia

Este proyecto es privado y propietario.

## 🤝 Contribución

Para contribuir al proyecto, por favor:

1. Crea un fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Haz commit de tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## 📞 Soporte

Para soporte técnico, contacta al equipo de desarrollo.
