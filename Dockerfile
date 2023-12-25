FROM node:14 as build-stage
WORKDIR /app

COPY package*json ./

COPY .env .
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.13.8 as production-stage
COPY --from=build-stage /app/www /usr/share/nginx/html

COPY --from=build-stage /app/jvjr-entrypoint.sh /
COPY --from=build-stage /app/jvjr-env.json /
RUN chmod +x /jvjr-entrypoint.sh

EXPOSE 80

ENTRYPOINT [ "/jvjr-entrypoint.sh", "/usr/share/nginx/html/js", "app" ]
CMD ["nginx", "-g", "daemon off;"]
