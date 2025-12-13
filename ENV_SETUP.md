# Configuración de Variables de Entorno

## Frontend (.env en la raíz del proyecto)

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Backend API Configuration
# URL base del backend Node.js (por defecto: http://localhost:3000/api/v1)
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### Ejemplo completo:

```env
# Backend API
VITE_API_BASE_URL=http://localhost:3000/api/v1

# Si necesitas usar Supabase para otras funcionalidades (opcional)
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

## Backend (.env en la carpeta Backend/)

Para el backend, consulta el README en `Backend/README.md` para las variables necesarias. Las principales son:

```env
# Database
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=localhost
DB_PORT=5432

# JWT
JWT_SECRET=your_jwt_secret_key

# App
PORT=3000
NODE_ENV=development
API_VERSION=v1

# CORS
CORS_ORIGIN=*
CORS_CREDENTIALS=false
```

## Notas

- Las variables que empiezan con `VITE_` son accesibles en el frontend
- No commitees archivos `.env` al repositorio (ya están en .gitignore)
- Para producción, configura estas variables en tu plataforma de hosting


