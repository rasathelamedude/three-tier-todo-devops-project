# Builder stage for compiling react app
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

ARG VITE_API_URL=http://localhost:3100
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# Runner stage for serving the compiled app
FROM nginx:1.28-alpine AS runner

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
