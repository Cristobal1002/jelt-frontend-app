# Documentación de Despliegue - AWS Amplify

## Descripción General del Frontend

Aplicación web SPA (Single Page Application) construida con React, TypeScript y Vite, diseñada para gestión de inventario inteligente.

## Stack Tecnológico

- **Framework**: React 18.3.1
- **Build Tool**: Vite 5.4.19
- **Lenguaje**: TypeScript 5.8.3
- **Estilos**: Tailwind CSS 3.4.17
- **UI Components**: Radix UI + shadcn/ui
- **Routing**: React Router DOM 6.30.1
- **State Management**: React Query (TanStack Query) 5.83.0
- **Gráficos**: Recharts 2.15.4
- **PDF Generation**: jsPDF 3.0.3

## Estructura del Proyecto

```
jelt-frontend-app/
├── src/
│   ├── components/          # Componentes React
│   │   ├── dashboard/      # Componentes del dashboard principal
│   │   └── ui/             # Componentes UI reutilizables (shadcn)
│   ├── contexts/           # Context providers (Auth, Filters)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilidades y API client
│   ├── pages/              # Páginas principales
│   ├── integrations/       # Integraciones externas (Supabase)
│   └── assets/             # Imágenes y recursos estáticos
├── public/                 # Archivos estáticos públicos
├── package.json           # Dependencias y scripts
├── vite.config.ts         # Configuración de Vite
├── tailwind.config.ts     # Configuración de Tailwind
└── tsconfig.json          # Configuración de TypeScript
```

## Scripts Disponibles

```json
{
  "dev": "vite",                    // Desarrollo local (puerto 8080)
  "build": "vite build",           // Build de producción
  "build:dev": "vite build --mode development",  // Build desarrollo
  "preview": "vite preview",       // Preview del build
  "lint": "eslint ."              // Linter
}
```

## Variables de Entorno Requeridas

El proyecto requiere las siguientes variables de entorno (prefijo `VITE_`):

### Obligatorias:
- `VITE_API_BASE_URL`: URL base del backend API
  - Ejemplo desarrollo: `http://localhost:3000/api/v1`
  - Ejemplo producción: `https://api.tudominio.com/api/v1`

### Opcionales (solo si se usan componentes mock con Supabase):
**NOTA**: Estos componentes están marcados como "mock" y usan Supabase:
- `ReorderTable.tsx`
- `CreatePurchaseOrderDialog.tsx`
- `AlertsList.tsx`
- `AIInsightsFeed.tsx`

Si estos componentes no se usan o se migran al backend, estas variables NO son necesarias:
- `VITE_SUPABASE_URL`: URL del proyecto Supabase (solo para componentes mock)
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Clave pública de Supabase (solo para componentes mock)

### Configuración en AWS Amplify:

1. **Console de Amplify** → Tu App → **Environment variables**
2. Agregar las variables con el prefijo `VITE_`
3. Ejemplo mínimo (solo lo necesario):
   ```
   VITE_API_BASE_URL = https://api.tudominio.com/api/v1
   ```

**Importante**: Las variables de Supabase (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) solo son necesarias si se usan los componentes mock que aún dependen de Supabase. Si todos los componentes están migrados al backend, estas variables NO son requeridas.

## Configuración de Build en Amplify

### Build Settings (amplify.yml o Console):

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### Configuración Manual en Console:

1. **Build settings**:
   - **Build command**: `npm run build`
   - **Base directory**: `.` (raíz del proyecto)
   - **Output directory**: `dist`

2. **Node version**: 
   - Recomendado: Node.js 18.x o superior
   - Verificar en `package.json` si hay restricciones

## Comandos de Build

El comando `npm run build` ejecuta:
- Compilación TypeScript
- Bundling con Vite
- Optimización de assets
- Generación de archivos estáticos en `dist/`

## Características Especiales

1. **Path Aliases**: 
   - `@/` apunta a `src/`
   - Configurado en `vite.config.ts` y `tsconfig.json`

2. **SPA Routing**:
   - Todas las rutas deben redirigir a `index.html` (configurar en Amplify)
   - React Router maneja el routing del lado del cliente

3. **API Client**:
   - Cliente HTTP personalizado en `src/lib/api-client.ts`
   - Usa JWT tokens almacenados en `localStorage`
   - Base URL configurable vía `VITE_API_BASE_URL`

## Configuración de Rewrites en Amplify

Para SPA, configurar redirects/rewrites:

**Console**: App settings → Rewrites and redirects

```json
[
  {
    "source": "/<*>",
    "target": "/index.html",
    "status": "200"
  }
]
```

O en `amplify.yml`:
```yaml
customHeaders:
  - pattern: '**/*'
    headers:
      - key: 'X-Content-Type-Options'
        value: 'nosniff'
      - key: 'X-Frame-Options'
        value: 'DENY'
      - key: 'X-XSS-Protection'
        value: '1; mode=block'
```

## Dependencias Principales

- **Runtime**: React, React DOM
- **Build**: Vite, TypeScript
- **UI**: Radix UI, Tailwind CSS
- **Routing**: React Router DOM
- **HTTP**: Fetch API nativo (no requiere axios)
- **Charts**: Recharts
- **PDF**: jsPDF, jspdf-autotable

## Notas Importantes

1. **CORS**: Asegurar que el backend permita requests desde el dominio de Amplify
2. **HTTPS**: Amplify provee HTTPS automáticamente
3. **Environment Variables**: Todas las variables deben tener prefijo `VITE_` para ser accesibles en el build
4. **Build Output**: Los archivos generados están en `dist/`
5. **Cache**: Considerar cachear `node_modules` para builds más rápidos

## Checklist de Despliegue

- [ ] Variables de entorno configuradas en Amplify
- [ ] `VITE_API_BASE_URL` apunta al backend de producción
- [ ] Rewrites configurados para SPA routing
- [ ] CORS configurado en el backend para el dominio de Amplify
- [ ] Build settings configurados correctamente
- [ ] Node version compatible (18.x+)
- [ ] Dominio personalizado configurado (opcional)

## Comandos de Verificación Local

```bash
# Instalar dependencias
npm install

# Build de producción local
npm run build

# Verificar que el build funciona
npm run preview

# Verificar linting
npm run lint
```

## Contacto

Para dudas sobre la estructura del proyecto, consultar:
- `package.json` para dependencias
- `vite.config.ts` para configuración de build
- `src/lib/api-client.ts` para configuración de API

