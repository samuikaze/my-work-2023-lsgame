FROM node:alpine AS builder

WORKDIR /usr/app

COPY ./package*.json ./
RUN apk update && \
  apk add --no-cache \
    util-linux \
    openssl && \
  echo "Install Angular cli ..." && \
  npm install -g @angular/cli && \
  echo "Install dependencies ..." && \
  npm install

COPY . .
COPY src src

RUN chmod +x ./.infrastructures/generate-secret-key.sh && \
  /bin/ash ./.infrastructures/generate-secret-key.sh && \
  ng build -c production --base-href /forwork/lsgames/

FROM nginx:alpine

COPY --from=builder /usr/app/dist/lsgames-frontend /usr/share/nginx/html
COPY ./.infrastructures/nginx-configuration.conf /etc/nginx/conf.d/default.conf

RUN find /usr/share/nginx/html -type f -exec chmod 644 {} \; \
  && find /usr/share/nginx/html -type d -exec chmod 755 {} \; \
