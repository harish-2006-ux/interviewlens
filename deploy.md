# 🚀 Quick Deployment Guide for InterviewLens

## Prerequisites Checklist

✅ **MongoDB Atlas Account** (Free tier)
- Create at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Get connection string

✅ **Gemini API Key** (Already configured)
- You have: `AQ.Ab8RN6K1J5DPGh5pqd-Rwvcm4-kSYJZA1FCr8Sdmzzwpw1WXNQ`

✅ **GitHub Account**
- To deploy via Render/Vercel

---

## 🎯 Fastest Path: Deploy to Render (5 minutes)

### Step 1: Setup MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create free account → Create free cluster
3. Create database user:
   - Username: `interviewlens`
   - Password: (generate strong password)
4. Network Access → Add IP Address → Allow access from anywhere (`0.0.0.0/0`)
5. Click "Connect" → "Connect your application"
6. Copy connection string:
   ```
   mongodb+srv://interviewlens:<password>@cluster0.xxxxx.mongodb.net/interviewlens?retryWrites=true&w=majority
   ```
7. Replace `<password>` with your actual password

### Step 2: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - InterviewLens"

# Create GitHub repo at https://github.com/new
# Name it: interviewlens

# Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/interviewlens.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy on Render

1. **Go to [Render Dashboard](https://dashboard.render.com/)**

2. **Sign up/Login** with GitHub

3. **Click "New" → "Blueprint"**

4. **Connect your repository**: `interviewlens`

5. **Render will detect `render.yaml`** - Click "Apply"

6. **Set Environment Variables**:
   
   Click on the **API service** → Environment tab:
   ```
   MONGODB_URI = mongodb+srv://interviewlens:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/interviewlens
   GEMINI_API_KEY = AQ.Ab8RN6K1J5DPGh5pqd-Rwvcm4-kSYJZA1FCr8Sdmzzwpw1WXNQ
   NODE_ENV = production
   PORT = 3001
   ```

7. **Wait 5-10 minutes** for deployment

8. **Your URLs**:
   - API: `https://interviewlens-api.onrender.com`
   - Frontend: `https://interviewlens-client.onrender.com`

### Step 4: Update Frontend Config

After backend deploys, update frontend to connect:

1. Go to Render Dashboard → `interviewlens-client` → Environment
2. Add variable:
   ```
   VITE_API_URL = https://interviewlens-api.onrender.com
   ```
3. Click "Save Changes" (will trigger redeploy)

### Step 5: Update CORS

Update `server/index.js` line 15 with your actual frontend URL:
```javascript
origin: process.env.NODE_ENV === 'production' 
  ? ['https://interviewlens-client.onrender.com']
  : ['http://localhost:3000'],
```

Commit and push:
```bash
git add server/index.js
git commit -m "Update CORS for production"
git push
```

---

## 🎉 Done! Test Your Live App

1. Visit: `https://interviewlens-client.onrender.com`
2. Click "AI Demo Interview"
3. Answer a question
4. Check if you get AI-generated feedback

---

## ⚠️ Important Notes

### Free Tier Limitations:
- **Apps sleep after 15 min** of inactivity
- First request takes ~30 seconds to wake up
- This is normal on free tier!

### WebRTC Video Chat:
- Video chat works on free tier
- Both users need to be awake simultaneously
- For production, consider upgrading to paid tier

---

## 🔧 Troubleshooting

### "Cannot connect to API"
- Check backend is running: Visit `https://interviewlens-api.onrender.com/api/health`
- Verify `VITE_API_URL` is set in frontend environment
- Check CORS settings in `server/index.js`

### "MongoDB connection error"
- Verify connection string has correct password
- Check IP whitelist includes `0.0.0.0/0`
- Ensure database user has read/write permissions

### "Gemini API error"
- Check API key is correct
- Verify you have quota: https://aistudio.google.com/app/apikey
- Try regenerating the key if needed

### Build fails
- Check logs in Render dashboard
- Verify all dependencies in package.json
- Ensure Node version is 18+

---

## 📊 Monitor Your App

### Render Dashboard:
- **Logs**: See real-time server logs
- **Metrics**: CPU, memory usage
- **Events**: Deployment history

### MongoDB Atlas:
- **Collections**: View stored data
- **Metrics**: Database operations
- **Alerts**: Setup monitoring

---

## 🚀 Optional: Custom Domain

Want `interviewlens.com` instead of `.onrender.com`?

1. Buy domain (Namecheap, GoDaddy, etc.)
2. Render Dashboard → Service → Settings → Custom Domain
3. Add domain and follow DNS instructions
4. SSL certificate auto-generated!

---

## 💡 Next Steps

### After Deployment:
1. ✅ Test all features
2. ✅ Share with friends for beta testing
3. ✅ Monitor usage in Render/MongoDB dashboards
4. ✅ Consider upgrading if traffic grows

### Marketing Ideas:
- Post on LinkedIn with demo video
- Share on Reddit (r/webdev, r/InterviewPrep)
- Add to your portfolio
- List on Product Hunt

---

## 📞 Need Help?

Check full documentation: [DEPLOYMENT.md](./DEPLOYMENT.md)

**Your app is ready to help thousands of people ace their interviews! 🎯**
