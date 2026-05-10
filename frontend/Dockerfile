FROM node:24.15.0-trixie-slim@sha256:4f2b45e32dc7d2caf66b6dbd59fac50e32f8077769efe0ef4d4c3f114672537d AS builder
WORKDIR /app
COPY app/package.json app/package-lock.json* ./
RUN npm ci
COPY app/ .
RUN npm run build

FROM nginxinc/nginx-unprivileged:alpine3.23-perl@sha256:8b87091ac53a3d9073fe265e83b2cb4dbeef3294e19ce3a802bf8f18184c79eb
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf.template /etc/nginx/templates/default.conf.template
ENV BACKEND_URL=http://backend:8080
EXPOSE 8080
