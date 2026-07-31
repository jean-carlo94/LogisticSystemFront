FROM node:22-alpine AS build

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

ARG VITE_API_BASE_URL=/api/v1
ARG VITE_CSP_ORIGINS=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_CSP_ORIGINS=$VITE_CSP_ORIGINS

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM nginx:alpine

RUN apk add --no-cache gettext

COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["/bin/sh", "-c", "envsubst '${CSP_IMG_ORIGINS} ${CSP_CONNECT_ORIGINS}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
