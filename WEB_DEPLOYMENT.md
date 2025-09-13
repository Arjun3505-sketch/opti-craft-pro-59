# AlphaForge Web Service - Render Deployment

## 🚀 Quick Deploy Guide

Deploy your AlphaForge trading platform web service to Render in just a few steps!

## 📋 What You're Deploying

- **Frontend**: React + Vite application with ApexCharts
- **Backend**: Python Flask API with Trading LLM
- **Database**: Supabase (external)

## 🔑 Required API Keys

You'll need these environment variables:

### Frontend (Static Site)

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### Backend (Web Service)

- `SUPABASE_URL`: Your Supabase project URL (same as above)
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key (same as above)
- `GEMINI_API_KEY`: Your Google Gemini API key

## 🛠️ Deployment Steps

### 1. Prepare Your Code

```bash
# Make sure all files are committed
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Deploy to Render

1. **Go to Render**: [render.com/dashboard](https://render.com/dashboard)
2. **Click "New +"** → **"Blueprint"**
3. **Connect GitHub**: Link your repository
4. **Render will detect** `render.yaml` automatically
5. **Click "Apply"** to create both services

### 3. Set Environment Variables

#### For Frontend Service (`alphaforge-web`):

1. Go to your frontend service in Render
2. Click **"Environment"** tab
3. Add these variables:
   - `VITE_SUPABASE_URL`: `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `your-anon-key`

#### For Backend Service (`alphaforge-api`):

1. Go to your backend service in Render
2. Click **"Environment"** tab
3. Add these variables:
   - `SUPABASE_URL`: `https://your-project.supabase.co`
   - `SUPABASE_ANON_KEY`: `your-anon-key`
   - `GEMINI_API_KEY`: `your-gemini-key`

### 4. Deploy!

- Both services will build and deploy automatically
- You'll get URLs like:
  - **Frontend**: `https://alphaforge-web.onrender.com`
  - **Backend**: `https://alphaforge-api.onrender.com`

## 🌐 Access Your App

Once deployed, visit your frontend URL to see your AlphaForge trading platform!

## 🔧 Configuration Details

### Frontend (Static Site)

- **Build**: `npm install && npm run build`
- **Output**: `./dist` directory
- **Framework**: React + Vite
- **Charts**: ApexCharts with candlestick support

### Backend (Web Service)

- **Runtime**: Python 3.11
- **Server**: Gunicorn with 4 workers
- **Health Check**: `/health` endpoint
- **API**: RESTful endpoints for trading data

## 📊 Monitoring

- **Health Check**: Backend has `/health` endpoint
- **Logs**: Available in Render dashboard
- **Uptime**: Render monitors service health

## 💰 Cost

- **Free Tier**: 750 hours/month per service
- **Sleep**: Services sleep after 15 minutes of inactivity
- **Wake Time**: ~30 seconds when accessed

## 🐛 Troubleshooting

### Common Issues:

1. **Build Fails**:

   - Check if all dependencies are in `package.json`
   - Verify Python version is 3.11

2. **Environment Variables**:

   - Make sure all required variables are set
   - Check variable names match exactly

3. **API Connection**:
   - Verify backend URL is correct in frontend
   - Check if backend is running and healthy

### Debug Commands:

```bash
# Check backend health
curl https://alphaforge-api.onrender.com/health

# Check if API is responding
curl https://alphaforge-api.onrender.com/api/status
```

## 🎯 What Happens After Deployment

1. **Frontend**: Your React app with world map background and candlestick charts
2. **Backend**: Flask API serving trading data and AI insights
3. **Database**: Connected to your Supabase instance
4. **Charts**: ApexCharts with professional candlestick visualization

## 🚀 Next Steps

1. **Test**: Visit your frontend URL and test all features
2. **Monitor**: Check logs and health status
3. **Custom Domain**: Add your own domain in Render
4. **Scale**: Upgrade plan if needed

---

**Your AlphaForge trading platform is now live! 🎉📈**
