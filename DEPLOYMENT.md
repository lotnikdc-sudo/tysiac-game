# 🚀 DEPLOYMENT GUIDE

## Lokalne (Desktop/Laptop)

### Windows
1. Upewnij się, że Node.js 16+ jest zainstalowany
2. Kliknij `START.bat`
3. Czekaj na instalację
4. Otwórz http://localhost:3000

### Mac/Linux
```bash
chmod +x START.sh
./START.sh
```

---

## Deployment na Heroku (Free Tier)

### 1. Przygotowanie

```bash
# Zainstaluj Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

heroku login
heroku create tysiąc-online
```

### 2. Backend (Node.js)

```bash
cd backend

# Zmień port na Heroku env variable
# W server.ts:
# const PORT = process.env.PORT || 3001;

heroku config:set PORT=5000

git init
git add .
git commit -m "Initial commit"

# Deploy
git push heroku main
```

### 3. Frontend

```bash
cd frontend

# Build
npm run build

# Deployuj na Netlify (bezpłatnie)
npm install -g netlify-cli
netlify deploy --prod --dir=build
```

---

## Deployment na AWS

### 1. EC2 Instance

```bash
# SSH do instancji
ssh -i key.pem ec2-user@your-instance.amazonaws.com

# Zainstaluj Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install nodejs

# Clone projekt
git clone https://github.com/your-repo/tysiac.git
cd tysiac

# Backend
cd backend
npm install
npm run build
node dist/server.js

# Frontend
cd frontend
npm install
npm run build

# Zainstaluj PM2 (process manager)
npm install -g pm2
pm2 start dist/server.js --name "tysiąc-backend"
pm2 startup
pm2 save
```

### 2. Frontend (S3 + CloudFront)

```bash
# Build frontend
cd frontend
npm run build

# Upload do S3
aws s3 sync build/ s3://your-bucket-name

# Konfiguruj CloudFront dla dystrybucji
```

---

## Deployment na Docker

### Dockerfile (Backend)

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3001

CMD ["node", "dist/server.js"]
```

### Build & Run

```bash
# Build image
docker build -t tysiac-backend .

# Run container
docker run -p 3001:3001 tysiac-backend

# Push do Docker Hub
docker push your-username/tysiac-backend:latest
```

---

## Docker Compose (Full Stack)

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - PORT=3001
    restart: always

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    restart: always
```

Uruchomienie:
```bash
docker-compose up -d
```

---

## Deployment na Vercel (Frontend)

```bash
cd frontend
npm install -g vercel
vercel

# Połącz ze swoim repo GitHub
# Auto deploy przy każdym push do main
```

---

## Konfiguracja Domeny

### DNS Records

```
A Record
Host: @
IP: your-server-ip

CNAME Record
Host: www
Points to: your-domain.com
```

### SSL Certificate (Let's Encrypt)

```bash
sudo apt-get install certbot
sudo certbot certonly --standalone -d your-domain.com
```

---

## Monitoring & Logs

### Heroku
```bash
heroku logs --tail
```

### AWS CloudWatch
```bash
aws logs tail /aws/ec2/tysiąc-backend --follow
```

### Docker
```bash
docker logs container-id --follow
```

---

## Performance Tips

1. **CDN** - CloudFlare dla frontend
2. **Database** - Dodaj MongoDB/PostgreSQL dla wyników
3. **Caching** - Redis dla sesji
4. **Load Balancer** - nginx/HAProxy
5. **Monitoring** - Sentry, DataDog

---

## Security

1. **HTTPS** - Obowiązkowy na production
2. **CORS** - Ogranicz do twojej domeny
3. **Rate Limiting** - Ochrona przed spamem
4. **Input Validation** - Sprawdzaj dane od klienta
5. **Environment Variables** - Nie hardcode sekrety

---

## Troubleshooting

| Problem | Rozwiązanie |
|---------|------------|
| Port w użyciu | Zmień PORT w env |
| 502 Bad Gateway | Sprawdź czy backend działa |
| CORS error | Dodaj backend URL do CORS |
| Memory leak | Sprawdź procesy Node.js |

---

## Scaling

Gdy rośnie liczba graczy:

1. **Horizontal Scaling** - Wiele instancji backendu
2. **Load Balancer** - Rozdzielaj traffic
3. **Message Queue** - Redis Pub/Sub zamiast Socket.io broadcast
4. **Database** - Zapis sesji gier
5. **Cache** - Memcached

---

Powodzenia z deployment! 🚀
