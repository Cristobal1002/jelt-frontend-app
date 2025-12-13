# 🚀 Guía de Inicio Rápido - Jelt Stock Sense

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** >= 18.0.0 ([Descargar](https://nodejs.org/))
- **npm** >= 9.0.0 (viene con Node.js)

## ⚠️ Importante sobre el Backend

**La carpeta `Backend/` en este proyecto es solo una COPIA de referencia** de tu backend externo. 

- El backend real debe estar corriendo en tu proyecto externo en **http://localhost:3000**
- No necesitas configurar ni iniciar nada en la carpeta `Backend/` de este proyecto
- Solo la copiaste para que entendiera cómo funciona tu API

## 🔧 Paso 1: Asegurar que el Backend esté corriendo

**Antes de iniciar el frontend, asegúrate de que tu backend externo esté corriendo:**

1. Ve a tu proyecto backend externo
2. Inicia el servidor (normalmente `npm run dev`)
3. Verifica que esté disponible en: **http://localhost:3000**
4. Prueba el health check: http://localhost:3000/api/v1/health

**El backend debe estar corriendo antes de iniciar el frontend.**

## 🎨 Paso 2: Configurar e Iniciar el Frontend

### 2.1. Navegar a la raíz del proyecto

```bash
cd /Users/cristobal/Downloads/jelt-stock-sense-main
```

### 2.2. Instalar dependencias del frontend

```bash
npm install
```

### 2.3. Configurar variables de entorno

Crea un archivo `.env` en la **raíz del proyecto** con:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

**Nota:** Si tu backend corre en otro puerto o URL, ajusta esta variable.

### 2.4. Iniciar el servidor frontend

```bash
npm run dev
```

El frontend estará disponible en: **http://localhost:8080**

## ✅ Paso 3: Verificar que todo funciona

1. **Backend funcionando**: 
   - Asegúrate de que tu backend externo esté corriendo
   - Abre http://localhost:3000/api/v1/health en tu navegador
   - Deberías ver una respuesta JSON

2. **Frontend funcionando**: 
   - Abre http://localhost:8080 en tu navegador
   - Deberías ver la página de login

3. **Crear una cuenta**: 
   - En la página de login, haz clic en "Sign Up"
   - Completa el formulario (nombre, email, contraseña)
   - Haz clic en "Create Account"
   - Serás redirigido automáticamente al dashboard

## 🐛 Solución de Problemas

### Error: "Network error" en el frontend
- **Verifica que tu backend externo esté corriendo** en el puerto 3000
- Verifica que `VITE_API_BASE_URL` en el `.env` del frontend sea correcto
- Reinicia el servidor frontend después de cambiar el `.env`

### El frontend no se conecta al backend
- **Asegúrate de que tu backend externo esté corriendo** antes de iniciar el frontend
- Verifica CORS en tu backend (debería permitir `*` o `http://localhost:8080` en desarrollo)
- Abre la consola del navegador (F12) para ver errores específicos
- Prueba el health check directamente: http://localhost:3000/api/v1/health

### Error: "CORS policy" en el navegador
- Tu backend debe tener configurado CORS para permitir peticiones desde `http://localhost:8080`
- En desarrollo, normalmente se permite `*` o se especifica el origen del frontend

## 📝 Comandos Útiles

### Backend (en tu proyecto externo)
```bash
# En tu proyecto backend externo:
npm run dev      # Desarrollo con auto-reload
npm start        # Producción
```

### Frontend (en este proyecto)
```bash
# En la raíz de este proyecto:
npm run dev      # Desarrollo
npm run build    # Build para producción
npm run lint     # Verificar código
```

## 🎯 Próximos Pasos

Una vez que todo esté funcionando:

1. **Explora la API**: Visita http://localhost:3000/api/v1/docs para ver la documentación Swagger
2. **Prueba el login**: Crea una cuenta y prueba el sistema de autenticación
3. **Revisa el código**: Explora los componentes del dashboard

## 💡 Tips

- **El backend debe estar corriendo en tu proyecto externo** antes de iniciar el frontend
- Mantén **dos terminales abiertas**: una para tu backend externo y otra para este frontend
- Si cambias variables de entorno en el frontend, **reinicia** el servidor frontend
- La carpeta `Backend/` en este proyecto es solo referencia, no la uses para correr el servidor
- Usa `Ctrl+C` para detener los servidores

