# 🚀 InterviewLens Deployment Guide

## Quick Deployment Options

### Option 1: Render (Recommended - Full Stack)

Render provides free hosting for both frontend and backend.

#### Step 1: Setup MongoDB Atlas (Free)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/interviewlens`)

#### Step 2: Deploy to Render

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/interviewlens.git
git push -u origin main
```

2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New" → "Blueprint"
4. Connect your GitHub repository
5. Render will detect the `render.yaml` file
6. Set environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `GEMINI_API_KEY`: Your Gemini API key (AIzaSy...)

7. Click "Apply" and wait for deployment (5-10 minutes)

#### Your URLs:
- **Frontend**: `https://interviewlens-client.onrender.com`
- **Backend API**: `https://interviewlens-api.onrender.com`

#### Update Frontend to Connect to Backend:
Edit `client/.env.production`:
```
VITE_API_URL=https://interviewlens-api.onrender.com
```

---

### Option 2: Vercel (Frontend) + Render (Backend)

#### Backend on Render:

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: interviewlens-api
   - **Root Directory**: server
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `NODE_ENV` = `production`
     - `MONGODB_URI` = Your MongoDB Atlas URI
     - `GEMINI_API_KEY` = Your Gemini API key
     - `PORT` = `3001`

5. Click "Create Web Service"

#### Frontend on Vercel:

1. Install Vercel CLI (optional):
```bash
npm install -g vercel
```

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New..." → "Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: client
   - **Build Command**: `npm run build`
   - **Output Directory**: dist
   - **Environment Variables**:
     - `VITE_API_URL` = Your Render backend URL

6. Click "Deploy"

---

### Option 3: Railway (Alternative All-in-One)

1. Go to [Railway](https://railway.app/)
2. Create new project from GitHub repo
3. Add MongoDB service (Railway provides this)
4. Deploy both services
5. Set environment variables in Railway dashboard

---

## Environment Variables Reference

### Backend (.env in server folder):
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/interviewlens
GEMINI_API_KEY=AIzaSy...
PORT=3001
NODE_ENV=production
```

### Frontend (.env.production in client folder):
```env
VITE_API_URL=https://your-backend-url.onrender.com
```

---

## Post-Deployment Checklist

✅ **Test the application**:
1. Visit your frontend URL
2. Try starting a new interview
3. Check if AI questions are generated
4. Test video chat functionality
5. Verify dashboard loads correctly

✅ **Update CORS settings** if needed (in `server/index.js`):
```javascript
app.use(cors({
  origin: ['https://your-frontend-url.vercel.app', 'https://interviewlens-client.onrender.com'],
  credentials: true
}));
```

✅ **Monitor logs**:
- Render: Dashboard → Your service → Logs
- Vercel: Dashboard → Your project → Deployments → View logs

---

## Troubleshooting

### API Connection Issues
- Check `VITE_API_URL` in frontend environment variables
- Verify CORS settings in backend
- Check if backend is running (visit `/api/health` endpoint)

### MongoDB Connection Failed
- Verify MongoDB Atlas connection string
- Check if IP whitelist includes `0.0.0.0/0` (allow all)
- Ensure database user has read/write permissions

### Gemini API Errors
- Verify API key is correct
- Check if you have API quota remaining
- Test API key: https://aistudio.google.com/app/apikey

### Build Errors
- Clear cache: `rm -rf node_modules package-lock.json`
- Reinstall: `npm install`
- Check Node version compatibility (use Node 18+)

---

## Free Tier Limits

### Render Free:
- Apps sleep after 15 minutes of inactivity
- 750 hours/month (enough for 1 app running 24/7)
- First request after sleep takes ~30 seconds

### Vercel Free:
- 100 GB bandwidth/month
- Unlimited deployments
- No sleep mode

### MongoDB Atlas Free:
- 512 MB storage
- Enough for thousands of interview sessions

---

## Production Optimizations

### Enable Build Optimizations:

**Client** (`client/vite.config.js`):
```javascript
build: {
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true,
    }
  }
}
```

**Server** (add compression):
```bash
cd server
npm install compression
```

In `server/index.js`:
```javascript
const compression = require('compression');
app.use(compression());
```

---

## Custom Domain (Optional)

### Render:
1. Go to service settings
2. Add custom domain
3. Update DNS records as instructed

### Vercel:
1. Go to project settings → Domains
2. Add domain
3. Configure DNS

---

## Support

If you encounter issues:
1. Check logs in your hosting platform
2. Test locally first: `npm run dev`
3. Verify all environment variables are set
4. Check MongoDB connection: `mongosh "your-connection-string"`

---

**🎉 Your InterviewLens is now live!**

Share your URL and start helping people ace their interviews!
