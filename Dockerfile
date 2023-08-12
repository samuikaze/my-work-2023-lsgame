FROM node:alpine AS builder

WORKDIR /usr/app

COPY ./package*.json ./
RUN npm install -g @angular/cli \
  && npm install

COPY . .
COPY src src

RUN ng build -c production --base-href /template/

FROM nginx:alpine

COPY --from=builder /usr/app/dist/frontend /usr/share/nginx/html
COPY ./nginx-configuration.conf /etc/nginx/conf.d/default.conf

RUN find /usr/share/nginx/html -type f -exec chmod 644 {} \; \
  && find /usr/share/nginx/html -type d -exec chmod 755 {} \; \
