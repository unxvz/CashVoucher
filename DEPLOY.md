# 🚀 Deploy Cash Online - Step by Step Guide

## Option 1: Railway (Easiest - Recommended) ⭐

Railway is the easiest way to deploy. Free tier includes:
- 500 hours/month execution
- Free PostgreSQL database
- Custom domain support

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub

### Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Connect your GitHub and select this repository
   - Or use "Empty Project" and add services manually

### Step 3: Add PostgreSQL Database
1. In your project, click "New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will automatically create a PostgreSQL database

### Step 4: Connect Database to App
1. Click on your web service
2. Go to "Variables" tab
3. Click "Add Variable Reference"
4. Select `DATABASE_URL` from the PostgreSQL service
5. Also add: `NODE_ENV` = `production`

### Step 5: Configure Build
1. Go to "Settings" tab
2. Set Build Command: `npm install && cd client && npm install && npm run build`
3. Set Start Command: `npm start`

### Step 6: Deploy
1. Railway will automatically deploy
2. Click "Generate Domain" to get your URL
3. Share this URL with your office team!

---

## Option 2: Render (Also Easy & Free)

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub

### Step 2: Create PostgreSQL Database
1. Click "New" → "PostgreSQL"
2. Name: `cash-online-db`
3. Select Free tier
4. Create Database
5. Copy the "External Database URL"

### Step 3: Create Web Service
1. Click "New" → "Web Service"
2. Connect your GitHub repo
3. Configure:
   - Name: `cash-online`
   - Environment: `Node`
   - Build Command: `npm install && cd client && npm install && npm run build`
   - Start Command: `npm start`

### Step 4: Add Environment Variables
1. Go to "Environment" tab
2. Add:
   - `DATABASE_URL` = (paste the External Database URL from step 2)
   - `NODE_ENV` = `production`

### Step 5: Deploy
1. Click "Create Web Service"
2. Wait for deployment
3. Your app will be at: `https://cash-online.onrender.com`

---

## Option 3: Supabase + Vercel (More Control)

### Part A: Setup Supabase Database

1. Go to https://supabase.com
2. Sign up / Login
3. Click "New Project"
4. Fill in:
   - Name: `cash-online`
   - Database Password: (save this!)
   - Region: Choose closest to your location
5. Wait for project to be created
6. Go to "Settings" → "Database"
7. Copy the "Connection string" (URI)
8. Replace `[YOUR-PASSWORD]` with your database password

### Part B: Deploy to Vercel

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Configure:
   - Framework: Other
   - Build Command: `cd client && npm install && npm run build`
   - Output Directory: `client/dist`
6. Add Environment Variables:
   - `DATABASE_URL` = (paste Supabase connection string)
   - `NODE_ENV` = `production`
7. Click "Deploy"

---

## After Deployment

### Share with Your Team
Once deployed, share the URL with your office team:
- `https://your-app.railway.app`
- `https://your-app.onrender.com`
- `https://your-app.vercel.app`

### First Time Setup
1. Open the app URL
2. Go to Settings
3. Set your Initial Balance
4. Start recording transactions!

### Data Migration (Optional)
If you have existing data in SQLite, you can export and import:

```bash
# Export from SQLite
sqlite3 server/cash.db ".dump transactions" > transactions.sql

# Then manually import to PostgreSQL
```

---

## Troubleshooting

### "Database connection failed"
- Check DATABASE_URL is correct
- Make sure password doesn't have special characters that need encoding

### "Build failed"
- Check Node.js version is 18+
- Try clearing cache and redeploying

### "App is slow"
- Free tier has cold starts (first request takes longer)
- Upgrade to paid tier for better performance

---

## Support

If you need help, check:
- Railway docs: https://docs.railway.app
- Render docs: https://render.com/docs
- Supabase docs: https://supabase.com/docs
