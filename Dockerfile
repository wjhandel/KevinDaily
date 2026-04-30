FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY vite.config.ts ./
COPY tsconfig*.json ./
COPY index.html ./
COPY public ./public
COPY src ./src

RUN npm install && npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
