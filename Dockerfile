FROM node:22-alpine3.19 as base
RUN apk add --no-cache tini
WORKDIR /app
COPY package*.json. /

FROM base as dev
ENV NODE_ENV=development
RUN run npm i
COPY . . 
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["run", "npm", "start:dev"]

FROM base as build 

ENV NODE_ENV=development
RUN npm ci
COPY . .

RUN npm run build
FROM base AS prod

ENV NODE_ENV=production \
    PORT=3000

COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist

RUN addgroup -S appgroup && adduser -S appuser -G appgroup && \
    chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD wget -qO- http://localhost:3000/health || exit 1

ENTRYPOINT ["/sbin/tini", "--"]


CMD [ "node ","dist/main.js"]