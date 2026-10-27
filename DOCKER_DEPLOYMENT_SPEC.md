# Comprehensive Dockerization & Server Deployment Specification

This document provides a complete, self-contained, and security-sanitized specification for dockerizing the **Organising-Chart** (College Venue Hub) application and deploying it to a production Linux server behind a reverse proxy. Any developer or automated AI coding platform can follow these instructions directly to implement the changes.

---

## 1. Application Overview & Architecture

* **Application Name:** Organising-Chart (College Venue Hub)
* **Frontend Tech Stack:** React 18, Vite 5, Tailwind CSS v4, Lucide React
* **Backend / Database Architecture:** Serverless — The application interacts directly with **Google Firebase Firestore** and **Google OAuth 2.0 (Firebase Authentication)** via the client-side Firebase SDK. There is no custom backend API or local SQL database.
* **Target Server Environment:** Production Linux server running Docker & Docker Compose behind a Host Reverse Proxy (Nginx) terminating SSL.
* **Deployment Pattern:**
  - Container-level Nginx Alpine server hosting static SPA assets.
  - Host-level Nginx reverse proxy routing traffic from `<YOUR_DOMAIN>` (e.g., `venues.college.edu`) to the container's mapped host port.
  - Dedicated Docker bridge network (e.g., `app-network`).
  - Isolated host port mapping: `${FRONTEND_PORT:-8082}` to avoid collisions with other running services.

---

## 2. Key Technical Requirements & Pitfalls to Solve

1. **Vite Compile-Time Environment Injection:**
   In Vite, variables prefixed with `VITE_` are inlined into static JavaScript during `npm run build`. They cannot be injected dynamically at container runtime using standard `environment:` variables in `docker-compose.yml`. They MUST be passed as Docker build arguments (`ARG` and `ENV`) during the build stage.

2. **Cross-Origin-Opener-Policy (COOP) for Google OAuth Popups:**
   When using Firebase Google Sign-In (`signInWithPopup`), modern browsers enforce strict window boundaries. The Nginx server MUST send the header:
   ```nginx
   add_header Cross-Origin-Opener-Policy "same-origin-allow-popups" always;
   ```
   Without this header, the Google OAuth popup cannot communicate back with the parent window, causing login to fail with `auth/popup-closed-by-user` or cross-origin errors.

3. **Client-Side SPA Routing & Caching:**
   - Single Page Applications must route all non-file requests to `/index.html` via `try_files $uri $uri/ /index.html;`.
   - `index.html` MUST have `Cache-Control: "no-cache, no-store, must-revalidate"` so users always receive updated releases immediately.
   - Hashed static assets (`/assets/*.js`, `/assets/*.css`, images) must be cached with long-term immutable headers.

4. **Port Allocation & Conflict Prevention:**
   Port `80` on the host machine is typically bound to the host-level reverse proxy. The container must NOT bind directly to `80:80` on the host. It must expose port 80 inside the container and map to an available host port (e.g., `${FRONTEND_PORT:-8082}:80`).

---

## 3. Exact File Specifications to Implement

### File 1: `Dockerfile`
Replace the contents of `Dockerfile` in the project root with the following multi-stage build:

```dockerfile
# =============================================================================
# Stage 1: Build the React SPA with Vite
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first for Docker layer caching
COPY package*.json ./
RUN npm ci

# Copy full application source code
COPY . .

# Build-time arguments for Vite environment variables
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_FIREBASE_MEASUREMENT_ID

# Export build args to environment for the Vite compiler
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID
ENV VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID
ENV VITE_FIREBASE_MEASUREMENT_ID=$VITE_FIREBASE_MEASUREMENT_ID

# Compile production bundle into /app/dist
RUN npm run build

# =============================================================================
# Stage 2: Serve static bundle with hardened Nginx
# =============================================================================
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose internal HTTP port
EXPOSE 80

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
```

---

### File 2: `nginx.conf`
Replace the contents of `nginx.conf` in the project root with the following production configuration:

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # Gzip Compression for fast delivery
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/x-javascript
        application/xml
        application/javascript
        application/json
        image/svg+xml;
    gzip_disable "MSIE [1-6]\.";

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    # CRITICAL: Required for Google OAuth popup sign-in
    add_header Cross-Origin-Opener-Policy "same-origin-allow-popups" always;

    # Lightweight Health Check Endpoint for Docker
    location = /health {
        access_log off;
        add_header Content-Type text/plain;
        return 200 "healthy\n";
    }

    # Cache static fingerprinted assets (JS, CSS, images, fonts)
    location ~* \.(?:ico|css|js|gif|jpe?g|png|webp|svg|woff2?|eot|ttf|otf)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        add_header Cross-Origin-Opener-Policy "same-origin-allow-popups" always;
        try_files $uri =404;
    }

    # SPA routing - redirect all page requests to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Prevent client caching of index.html so updates are immediately loaded
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires 0;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Cross-Origin-Opener-Policy "same-origin-allow-popups" always;
    }
}
```

---

### File 3: `docker-compose.yml`
Replace the contents of `docker-compose.yml` in the project root with:

```yaml
version: '3.8'

services:
  college-venue-hub:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}
        - VITE_FIREBASE_API_KEY=${VITE_FIREBASE_API_KEY}
        - VITE_FIREBASE_AUTH_DOMAIN=${VITE_FIREBASE_AUTH_DOMAIN}
        - VITE_FIREBASE_PROJECT_ID=${VITE_FIREBASE_PROJECT_ID}
        - VITE_FIREBASE_STORAGE_BUCKET=${VITE_FIREBASE_STORAGE_BUCKET}
        - VITE_FIREBASE_MESSAGING_SENDER_ID=${VITE_FIREBASE_MESSAGING_SENDER_ID}
        - VITE_FIREBASE_APP_ID=${VITE_FIREBASE_APP_ID}
        - VITE_FIREBASE_MEASUREMENT_ID=${VITE_FIREBASE_MEASUREMENT_ID}
    container_name: college-venue-hub
    restart: unless-stopped
    ports:
      - "${FRONTEND_PORT:-8082}:80"
    environment:
      - VIRTUAL_HOST=${VIRTUAL_HOST:-venues.example.edu}
    healthcheck:
      test: ["CMD-SHELL", "wget -q --spider http://127.0.0.1/health || exit 1"]
      interval: 15s
      timeout: 5s
      retries: 3
      start_period: 5s

# Connect to the server docker network (creates if not existing)
networks:
  default:
    name: ${DOCKER_NETWORK:-mec}
```

---

### File 4: `.env.example`
Create `.env.example` in the project root with placeholder values:

```env
# Server Configuration
FRONTEND_PORT=8082
VIRTUAL_HOST=venues.example.edu
DOCKER_NETWORK=mec

# Google Cloud OAuth 2.0 Client ID (replace with your actual client ID)
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Firebase Cloud Firestore Database (replace with your actual project credentials)
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-firebase-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

---

### File 5: `.dockerignore`
Ensure `.dockerignore` prevents leakage of local environment files, caches, and repository history:

```ignore
.env
.env.local
.env.*.local
node_modules
dist
.git
.github
.agents
.vscode
.idea
*.log
.DS_Store
```

---

## 4. Host Nginx Reverse Proxy Configuration (On Host Server)

The host server runs an Nginx instance that terminates SSL and routes incoming requests to individual Docker containers based on the domain name.

Create `/etc/nginx/sites-available/<your-subdomain>.conf` on the server:

```nginx
# HTTP - Redirect all traffic to HTTPS
server {
    listen 80;
    server_name <YOUR_DOMAIN>; # e.g., venues.example.edu
    return 301 https://$host$request_uri;
}

# HTTPS - Reverse Proxy to Docker Container
server {
    listen 443 ssl;
    server_name <YOUR_DOMAIN>; # e.g., venues.example.edu

    # SSL Certificate Paths
    ssl_certificate     /path/to/ssl/certificate.pem;
    ssl_certificate_key /path/to/ssl/private_key.key;

    # SSL protocols and ciphers
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://127.0.0.1:8082;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the configuration on the server:
```bash
sudo ln -s /etc/nginx/sites-available/<your-subdomain>.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 5. Google Cloud & Firebase Console Whitelist Checklist

> [!IMPORTANT]
> Google OAuth and Firebase Authentication will fail with `auth/unauthorized-domain` or origin mismatches until the production domain is whitelisted. Complete these two steps:

### Step 1: Firebase Console
1. Navigate to [Firebase Console](https://console.firebase.google.com/) and open your project.
2. Go to **Authentication** -> **Settings** tab -> **Authorized domains**.
3. Click **Add domain** and enter:
   - `<YOUR_DOMAIN>` (e.g., `venues.example.edu`)
   - The public server IP address (if accessing directly for initial testing).

### Step 2: Google Cloud Console
1. Navigate to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
2. Select your OAuth 2.0 Web Client ID.
3. Under **Authorized JavaScript origins**, add:
   - `https://<YOUR_DOMAIN>`
   - `http://localhost:8082` (for local Docker testing).
4. Save the changes.

---

## 6. Critical Security Best Practices for Firebase / Firestore

1. **Never commit actual `.env` files to source control:**
   Keep `.env` in `.gitignore` and `.dockerignore`. Only populate `.env` directly on the destination server.

2. **Lock Down Cloud Firestore Security Rules:**
   Ensure production Firestore security rules restrict writes to authenticated users rather than having open access (`allow write: if true`). At a minimum, enforce authenticated write access:
   ```firestore-rules
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Bookings: Publicly readable; only authenticated users can create
       match /bookings/{bookingId} {
         allow read: if true;
         allow create, update, delete: if request.auth != null;
       }
       // Admin restricted collections
       match /settings/{settingId} {
         allow read: if true;
         allow write: if request.auth != null;
       }
       match /{document=**} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

---

## 7. Deployment Execution Steps (On the Host Server)

1. **Clone or Copy Repository:**
   ```bash
   git clone <repository_url> Organising-Chart
   cd Organising-Chart
   ```

2. **Configure Environment:**
   ```bash
   cp .env.example .env
   # Populate .env with actual production keys
   ```

3. **Build and Run Docker Containers:**
   ```bash
   docker compose up -d --build
   ```

4. **Verify Container Health:**
   ```bash
   docker ps
   # Container 'college-venue-hub' should show '(healthy)' status
   
   curl -I http://127.0.0.1:8082/health
   # Expected response: HTTP/1.1 200 OK
   ```

5. **Verify Full Application in Browser:**
   - Open `https://<YOUR_DOMAIN>`.
   - Test Google Sign-In with an authorized email account.
   - Test venue bookings and confirm live updates.
