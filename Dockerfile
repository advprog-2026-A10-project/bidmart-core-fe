FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
COPY pnpm-lock.yaml* yarn.lock* package-lock.json* ./
RUN if [ -f pnpm-lock.yaml ]; then corepack enable && pnpm install --frozen-lockfile; \
    elif [ -f yarn.lock ]; then corepack enable && yarn install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    else npm install; fi
COPY . .
RUN if [ -f pnpm-lock.yaml ]; then corepack enable && pnpm run build; \
    elif [ -f yarn.lock ]; then yarn build; \
    else npm run build; fi
RUN if [ -d dist ]; then mv dist /tmp/site; \
    elif [ -d build ]; then mv build /tmp/site; \
    else echo "No dist/build output found" && exit 1; fi

FROM nginx:1.29.8-alpine
COPY --from=builder /tmp/site/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
