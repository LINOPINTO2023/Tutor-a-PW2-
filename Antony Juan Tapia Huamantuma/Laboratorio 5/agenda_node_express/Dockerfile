
# Imagen base de Node.js
FROM node:22-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar los archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm install --omit=dev

# Copiar el código de la aplicación
COPY server.js ./
COPY pub ./pub

# Crear el directorio para los eventos
RUN mkdir -p /app/data/events

# Puerto interno de Express
EXPOSE 3000

# Iniciar el servidor
CMD ["npm", "start"]