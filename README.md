# Jelt Stock Sense - Inventory Management System

Sistema de gestión de inventario inteligente con IA, construido con React + TypeScript y backend Node.js.

## 🚀 Inicio Rápido

### ⚠️ Importante sobre el Backend

**La carpeta `Backend/` en este proyecto es solo una COPIA de referencia** de tu backend externo. 

- El backend real debe estar corriendo en tu proyecto externo en **http://localhost:3000**
- No necesitas configurar ni iniciar nada en la carpeta `Backend/` de este proyecto
- Solo está ahí como referencia para entender cómo funciona la API

### Prerrequisitos

- Node.js >= 18.0.0
- npm >= 9.0.0
- **Tu backend externo corriendo en http://localhost:3000**

### Configuración del Frontend

1. En la raíz del proyecto, instala las dependencias:
```sh
npm install
```

2. Crea un archivo `.env` en la raíz del proyecto:
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

3. Inicia el servidor de desarrollo:
```sh
npm run dev
# El frontend estará disponible en http://localhost:8080
```

### Estructura del Proyecto

```
├── Backend/              # ⚠️ SOLO REFERENCIA - Copia de tu backend externo
│   └── ...              # No usar para correr el servidor
├── src/                 # Frontend React + TypeScript
│   ├── components/      # Componentes React
│   ├── contexts/        # Contextos (Auth, Filters)
│   ├── lib/             # Utilidades (API client)
│   └── pages/           # Páginas principales
└── package.json
```

**Nota:** Para ver la guía completa de inicio, consulta [INICIO_RAPIDO.md](./INICIO_RAPIDO.md)

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## 🛠️ Tecnologías

### Frontend
- **Vite** - Build tool
- **React 18** - Framework UI
- **TypeScript** - Tipado estático
- **shadcn-ui** - Componentes UI
- **Tailwind CSS** - Estilos
- **React Router** - Routing
- **React Query** - Gestión de estado del servidor

### Backend
- **Node.js** - Runtime
- **Express** - Framework web
- **Sequelize** - ORM para PostgreSQL
- **JWT** - Autenticación
- **Swagger** - Documentación API
- **Pino** - Logger

## 📝 API Endpoints

### Autenticación
- `POST /api/v1/auth/register` - Registro de usuario
- `POST /api/v1/auth/login` - Login de usuario
- `PUT /api/v1/auth/update` - Actualizar usuario (requiere auth)
- `DELETE /api/v1/auth/delete` - Eliminar usuario (requiere auth)
- `GET /api/v1/auth/find?email=...` - Buscar usuario por email

### Health Check
- `GET /api/v1/health` - Health check básico

### Documentación
- `GET /api/v1/docs` - Swagger UI
- `GET /api/v1/docs.json` - Swagger JSON

## 🔐 Autenticación

El sistema usa JWT (JSON Web Tokens) para autenticación. Después de hacer login, el token se almacena en `localStorage` y se envía automáticamente en el header `Authorization: Bearer <token>` en todas las peticiones.

## 📦 Scripts Disponibles

### Frontend
- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Build para producción
- `npm run lint` - Verifica código con ESLint

### Backend (en tu proyecto externo)
- `npm run dev` - Inicia servidor con nodemon
- `npm start` - Inicia servidor en producción
- `npm test` - Ejecuta tests

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/aa85075d-fd57-4c5c-baf1-cdb634afbc51) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
