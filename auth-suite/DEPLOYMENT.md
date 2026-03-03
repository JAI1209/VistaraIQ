# VistaraIQ Deployment Guide

## 1) Backend Deploy (Render or Heroku)

### Render
1. Create a new **Web Service** from `auth-suite/backend`.
2. Build command: `npm install`
3. Start command: `npm start`
4. Set environment variables:
   - `NODE_ENV=production`
   - `PORT=10000` (or Render default)
   - `DB_URI=<mongodb connection string>`
   - `JWT_SECRET=<long random secret>`
   - `JWT_REFRESH_SECRET=<long random secret>`
   - `FRONTEND_URL=<frontend domain>`
   - `CORS_ORIGIN=<frontend domain>`
   - SMTP and OAuth variables

### Heroku
1. `heroku create vistaraiq-auth`
2. Set root to `auth-suite/backend` (monorepo buildpack or Procfile strategy)
3. `heroku config:set` all env vars listed above
4. Deploy with GitHub integration or Heroku CLI

## 2) Frontend Deploy (Vercel or Netlify)

### Vercel
1. Import repository.
2. Set Root Directory: `auth-suite/frontend`.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Set env:
   - `VITE_API_URL=<backend URL>`

### Netlify
1. New site from Git.
2. Base directory: `auth-suite/frontend`
3. Build command: `npm run build`
4. Publish directory: `auth-suite/frontend/dist`
5. Set `VITE_API_URL` in environment variables.

## 3) OAuth Setup

### Google
- Authorized redirect URI:
  - `https://<backend-domain>/api/auth/google/callback`

### GitHub
- Authorization callback URL:
  - `https://<backend-domain>/api/auth/github/callback`

Also update backend env:
- `GOOGLE_CALLBACK_URL`
- `GITHUB_CALLBACK_URL`

## 4) HTTPS + CORS policy

- Use HTTPS-only production domains.
- Set `NODE_ENV=production` so cookies use secure settings.
- Set `CORS_ORIGIN` to exact frontend origin (no wildcard with credentials).
- If frontend and backend are on different domains, ensure:
  - `withCredentials: true` on frontend requests
  - `sameSite=none` + `secure=true` cookies in production.

## 5) Post-deploy smoke checklist

1. Register works and sets cookies.
2. Login works and `/api/auth/me` returns user.
3. Refresh token rotates via `/api/auth/refresh-token`.
4. `/dashboard` redirects to `/login` without auth.
5. Forgot/reset password link flow works.
6. Verify-email flow works.
7. Google and GitHub OAuth callback succeeds.
