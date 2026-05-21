FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY .env ./.env
COPY src ./src
COPY storage ./storage

RUN mkdir -p storage/invoices storage/lich-su-ck

EXPOSE 5000

CMD ["npm", "start"]
