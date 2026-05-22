FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json ./
COPY pnpm-lock.yaml* yarn.lock* package-lock.json* ./
RUN if [ -f pnpm-lock.yaml ]; then corepack enable && pnpm install --frozen-lockfile; \
    elif [ -f yarn.lock ]; then corepack enable && yarn install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    else npm install; fi

FROM deps AS builder
WORKDIR /app
ARG VITE_API_BASE_URL=""
ARG VITE_BIDDING_WS_URL=""
ARG VITE_AUTH_LOGIN_URL=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_BIDDING_WS_URL=$VITE_BIDDING_WS_URL
ENV VITE_AUTH_LOGIN_URL=$VITE_AUTH_LOGIN_URL
COPY . .
RUN if [ -f pnpm-lock.yaml ]; then corepack enable && pnpm run build; \
    elif [ -f yarn.lock ]; then yarn build; \
    else npm run build; fi

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY package.json ./
COPY pnpm-lock.yaml* yarn.lock* package-lock.json* ./
RUN if [ -f pnpm-lock.yaml ]; then corepack enable && pnpm install --frozen-lockfile --prod; \
    elif [ -f yarn.lock ]; then corepack enable && yarn install --frozen-lockfile --production=true; \
    elif [ -f package-lock.json ]; then npm ci --omit=dev; \
    else npm install --omit=dev; fi
COPY --from=builder /app/build ./build
EXPOSE 3000
CMD ["npm", "run", "start"]
