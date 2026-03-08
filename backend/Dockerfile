FROM oven/bun:1.2-alpine AS runner

RUN addgroup -S express && adduser -S express -G express

WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

COPY . .

RUN chown -R express:express /app

USER express

EXPOSE 3100

CMD ["bun", "run", "start"]
