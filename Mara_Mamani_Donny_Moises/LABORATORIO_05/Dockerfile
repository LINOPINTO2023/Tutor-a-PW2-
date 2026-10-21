FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
    && apt-get install -y --no-install-recommends nginx nodejs npm \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .
COPY nginx.conf /etc/nginx/sites-available/default
RUN chmod +x start.sh

EXPOSE 80

CMD ["./start.sh"]
