# Usa la imagen más reciente de Node.js para la compilación
FROM node:latest AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Segunda fase: Servir la aplicación con Nginx ---
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]