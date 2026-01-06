# Guía de Despliegue en AWS EC2

## Prerrequisitos

- Instancia EC2 creada (Ubuntu recomendado)
- Archivo `.pem` (key pair) descargado
- Acceso SSH a la instancia

## Paso 1: Conectarse a la Instancia EC2

### En MacOS/Linux:
```bash
# Dar permisos al archivo .pem
chmod 400 /ruta/a/tu/key.pem

# Conectarse a la instancia
ssh -i /ruta/a/tu/key.pem ubuntu@TU_IP_PUBLICA
# O si es Amazon Linux:
ssh -i /ruta/a/tu/key.pem ec2-user@TU_IP_PUBLICA
```

### En Windows (usando Git Bash o WSL):
```bash
# Mismo comando que en MacOS/Linux
ssh -i /ruta/a/tu/key.pem ubuntu@TU_IP_PUBLICA
```

**Nota**: Reemplaza `TU_IP_PUBLICA` con la IP pública de tu instancia EC2.

## Paso 2: Actualizar el Sistema

```bash
# Actualizar paquetes
sudo apt update && sudo apt upgrade -y

# Si es Amazon Linux:
# sudo yum update -y
```

## Paso 3: Instalar Node.js y npm

### Para Ubuntu/Debian:
```bash
# Instalar Node.js 18.x (LTS recomendado)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
node --version
npm --version
```

### Para Amazon Linux:
```bash
# Instalar Node.js 18.x
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Verificar instalación
node --version
npm --version
```

## Paso 4: Instalar Nginx

```bash
# Instalar Nginx
sudo apt install nginx -y

# Para Amazon Linux:
# sudo yum install nginx -y

# Iniciar y habilitar Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verificar estado
sudo systemctl status nginx
```

## Paso 5: Configurar Security Group en AWS

En la consola de AWS EC2:

1. Ve a **Security Groups** → Selecciona el security group de tu instancia
2. **Inbound rules** → **Edit inbound rules** → **Add rule**:
   - **Type**: HTTP
   - **Port**: 80
   - **Source**: 0.0.0.0/0
   - **Description**: Allow HTTP
3. **Add rule** (opcional, para HTTPS):
   - **Type**: HTTPS
   - **Port**: 443
   - **Source**: 0.0.0.0/0
   - **Description**: Allow HTTPS
4. Guardar cambios

## Paso 6: Subir el Código a la Instancia

### Opción A: Clonar desde Git (Recomendado)

```bash
# Instalar Git si no está instalado
sudo apt install git -y

# Crear directorio para la aplicación
sudo mkdir -p /var/www/jelt-frontend
sudo chown -R $USER:$USER /var/www/jelt-frontend

# Clonar el repositorio
cd /var/www/jelt-frontend
git clone https://github.com/tu-usuario/tu-repo.git .

# O si el repo es privado, configurar SSH keys o usar HTTPS con token
```

### Opción B: Subir archivos con SCP

Desde tu máquina local:

```bash
# Comprimir el proyecto (excluyendo node_modules)
tar -czf jelt-frontend.tar.gz --exclude='node_modules' --exclude='dist' --exclude='.git' jelt-frontend-app/

# Subir a EC2
scp -i /ruta/a/tu/key.pem jelt-frontend.tar.gz ubuntu@TU_IP_PUBLICA:/tmp/

# En la instancia EC2, descomprimir:
ssh -i /ruta/a/tu/key.pem ubuntu@TU_IP_PUBLICA
cd /var/www
sudo mkdir -p jelt-frontend
sudo chown -R $USER:$USER jelt-frontend
cd jelt-frontend
tar -xzf /tmp/jelt-frontend.tar.gz --strip-components=1
```

## Paso 7: Instalar Dependencias y Hacer Build

```bash
cd /var/www/jelt-frontend

# Instalar dependencias
npm install

# Crear archivo .env con las variables de entorno
nano .env
```

**Contenido del archivo `.env`**:
```env
VITE_API_BASE_URL=https://api.tudominio.com/api/v1
# Opcional (solo si usas componentes mock con Supabase):
# VITE_SUPABASE_URL=tu_supabase_url
# VITE_SUPABASE_PUBLISHABLE_KEY=tu_supabase_key
```

Guardar con `Ctrl+O`, `Enter`, `Ctrl+X`

```bash
# Hacer build de producción
npm run build

# Verificar que se creó la carpeta dist
ls -la dist/
```

## Paso 8: Configurar Nginx

```bash
# Crear configuración de Nginx
sudo nano /etc/nginx/sites-available/jelt-frontend
```

**Contenido del archivo**:
```nginx
server {
    listen 80;
    server_name TU_DOMINIO_O_IP;  # Reemplazar con tu dominio o IP pública
    
    root /var/www/jelt-frontend/dist;
    index index.html;

    # Configuración para SPA (React Router)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache para assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Compresión gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # Headers de seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

**Si no tienes dominio, usar la IP pública**:
```nginx
server {
    listen 80;
    server_name _;  # Acepta cualquier dominio/IP
    
    root /var/www/jelt-frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
}
```

```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/jelt-frontend /etc/nginx/sites-enabled/

# Eliminar configuración por defecto (opcional)
sudo rm /etc/nginx/sites-enabled/default

# Verificar configuración de Nginx
sudo nginx -t

# Si todo está bien, recargar Nginx
sudo systemctl reload nginx
```

## Paso 9: Configurar Permisos

```bash
# Dar permisos correctos a los archivos
sudo chown -R www-data:www-data /var/www/jelt-frontend/dist
sudo chmod -R 755 /var/www/jelt-frontend
```

## Paso 10: Verificar el Despliegue

1. Abre tu navegador y ve a: `http://TU_IP_PUBLICA`
2. Deberías ver la aplicación funcionando

## Paso 11: (Opcional) Configurar SSL con Let's Encrypt

Si tienes un dominio:

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificado SSL
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Certbot configurará automáticamente Nginx para HTTPS
# Renovación automática está configurada por defecto
```

## Paso 12: (Opcional) Configurar Auto-deploy con Script

Crear script para actualizar la aplicación:

```bash
# Crear script de deploy
nano ~/deploy.sh
```

**Contenido**:
```bash
#!/bin/bash
cd /var/www/jelt-frontend

# Pull latest changes (si usas Git)
git pull origin main

# Install dependencies
npm install

# Build
npm run build

# Reload Nginx
sudo systemctl reload nginx

echo "Deploy completado!"
```

```bash
# Dar permisos de ejecución
chmod +x ~/deploy.sh

# Ejecutar cuando necesites actualizar
~/deploy.sh
```

## Comandos Útiles

```bash
# Ver logs de Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Reiniciar Nginx
sudo systemctl restart nginx

# Ver estado de Nginx
sudo systemctl status nginx

# Verificar puertos en uso
sudo netstat -tlnp | grep :80

# Ver procesos de Node (si los hay)
ps aux | grep node
```

## Troubleshooting

### Error 502 Bad Gateway
- Verificar que Nginx está corriendo: `sudo systemctl status nginx`
- Verificar permisos: `ls -la /var/www/jelt-frontend/dist`
- Ver logs: `sudo tail -f /var/log/nginx/error.log`

### La aplicación no carga
- Verificar que el build se completó: `ls -la /var/www/jelt-frontend/dist`
- Verificar configuración de Nginx: `sudo nginx -t`
- Verificar que el Security Group permite tráfico en puerto 80

### Variables de entorno no funcionan
- Verificar que el archivo `.env` existe y tiene las variables correctas
- Recordar que en Vite las variables deben tener prefijo `VITE_`
- Hacer rebuild después de cambiar `.env`: `npm run build`

### Error de CORS
- Verificar que `VITE_API_BASE_URL` apunta al backend correcto
- Verificar que el backend permite requests desde el dominio/IP de EC2

## Checklist Final

- [ ] Instancia EC2 creada y accesible
- [ ] Node.js y npm instalados
- [ ] Nginx instalado y corriendo
- [ ] Security Group configurado (puerto 80 abierto)
- [ ] Código subido a `/var/www/jelt-frontend`
- [ ] Archivo `.env` creado con `VITE_API_BASE_URL`
- [ ] Build completado (`npm run build`)
- [ ] Nginx configurado y recargado
- [ ] Permisos correctos en archivos
- [ ] Aplicación accesible en `http://TU_IP_PUBLICA`
- [ ] (Opcional) SSL configurado con Certbot
- [ ] (Opcional) Script de deploy creado

## Notas Importantes

1. **Variables de entorno**: Solo `VITE_API_BASE_URL` es obligatoria. Las de Supabase son opcionales.
2. **SPA Routing**: La configuración de Nginx con `try_files` es crucial para que React Router funcione.
3. **Build**: Siempre hacer `npm run build` después de cambios en el código o variables de entorno.
4. **Seguridad**: Considera configurar un firewall adicional (UFW) y mantener el sistema actualizado.
5. **Backup**: Considera hacer backups regulares de `/var/www/jelt-frontend`.

## Próximos Pasos (Opcional)

- Configurar dominio personalizado
- Configurar SSL/HTTPS con Let's Encrypt
- Configurar CI/CD para auto-deploy
- Configurar monitoreo y alertas
- Configurar backup automático

