FROM node:22-slim

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build

ENV HOST=0.0.0.0
ENV PORT=4321

EXPOSE 4321

RUN mkdir -p /app/data /app/public/uploads
VOLUME ["/app/data", "/app/public/uploads"]

CMD ["node", "./dist/server/entry.mjs"]
