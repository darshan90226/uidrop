# Put UIDrop online (free): GitHub + Neon + Render

You need three free accounts. The app is served from one URL (frontend and API together).

## 1. Database (Neon)
1. Sign up at https://neon.tech and create a project (any name, nearest region).
2. On the dashboard open **Connect**, turn **off** "Connection pooling", and copy the connection string. It looks like `postgresql://user:pass@ep-xxxx.neon.tech/neondb?sslmode=require`.
3. Keep it handy. This is your `DATABASE_URL`.

## 2. Code on GitHub
1. Create an account at https://github.com and a new empty repository named `uidrop` (Private is fine).
2. From the `uidrop` folder (the one with `client`, `server`, `package.json`):
```bash
git init
git add .
git commit -m "UIDrop"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/uidrop.git
git push -u origin main
```
`.gitignore` already keeps `node_modules`, `.env` and the local database out.

## 3. Host on Render
1. Sign up at https://render.com with GitHub, then **New > Web Service** and pick your `uidrop` repo.
2. Settings:
   - **Runtime:** Node
   - **Build Command:** `npm install --include=dev && npm run build && npm run db:setup`
   - **Start Command:** `npm start`
   - **Instance type:** Free
3. **Environment variables** (Add each):
   - `DATABASE_URL` = the Neon string from step 1
   - `ADMIN_TOKEN` = a long random password you choose (this logs you into `/#admin`)
   - `NODE_VERSION` = `20`
4. Click **Create Web Service**. After the build, your site is live at `https://your-name.onrender.com`.

## Notes
- Free Render services sleep after ~15 minutes without visitors; the first visit afterwards takes ~30 seconds to wake.
- Moderate submissions at `https://your-name.onrender.com/#admin`.
- To update the site later: change code, `git add . && git commit -m "update" && git push`. Render redeploys automatically.
- Never commit `server/.env` or share your `ADMIN_TOKEN`.

## Option: GitHub Pages (frontend only, demo mode)
1. Push the repo to GitHub (step 2 above). The repo must be **Public** on a free account.
2. Repo **Settings > Pages > Build and deployment > Source: GitHub Actions**.
3. Go to the **Actions** tab and wait for "Deploy to GitHub Pages" to turn green. The site is at `https://YOUR-USERNAME.github.io/uidrop/`.
4. Submissions are not saved in this mode. To add the backend later, deploy the server on Render, then in repo **Settings > Secrets and variables > Actions > Variables** add `VITE_API_URL` = your Render URL, and set `CLIENT_ORIGIN=https://YOUR-USERNAME.github.io` on Render.
