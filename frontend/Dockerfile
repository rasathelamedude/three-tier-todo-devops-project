# Builder stage for compiling react app
FROM node:18-alpine AS builder

WORKDIR /app

RUN addgroup -S react && adduser -S react -G react

COPY package*.json ./
RUN npm install

COPY . .

RUN chown -R react:react /app
USER react

RUN npm run build

# Runner stage for serving the compiled app
FROM nginx:1.28-alpine AS runner

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
