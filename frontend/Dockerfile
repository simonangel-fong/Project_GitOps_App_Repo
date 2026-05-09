FROM node:22-alpine AS builder
WORKDIR /app
COPY app/package.json app/package-lock.json* ./
RUN npm ci
COPY app/ .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf.template /etc/nginx/templates/default.conf.template
ENV BACKEND_URL=http://backend:8080
EXPOSE 80
