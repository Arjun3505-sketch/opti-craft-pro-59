# AlphaForge Trading Platform - Render Deployment Guide

## 🚀 Deployment Overview

This guide will help you deploy your AlphaForge Trading Platform to Render using the provided `render.yaml` configuration.

## 📋 Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Push your code to GitHub
3. **API Keys**: Gather your required API keys

## 🔑 Required Environment Variables

### For Trading LLM Backend:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `GEMINI_API_KEY`: Your Google Gemini API key
- `FINNHUB_API_KEY`: Your Finnhub API key (optional, has default)

### For Frontend:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `VITE_API_BASE_URL`: Will be set to your backend URL automatically

## 🛠️ Deployment Steps

### 1. Prepare Your Repository

1. **Push to GitHub**: Ensure all your code is pushed to your GitHub repository
2. **Verify Files**: Make sure these files are in your repository:
   - `render.yaml` (in root directory)
   - `trading_llm/start.sh` (startup script)
   - `trading_llm/requirements.txt`
   - `trading_llm/app.py`

### 2. Deploy to Render

1. **Connect Repository**:

   - Go to [render.com/dashboard](https://render.com/dashboard)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository

2. **Configure Services**:

   - Render will automatically detect the `render.yaml` file
   - It will create 3 services:
     - `trading-llm-backend` (Python Flask API)
     - `alphaforge-frontend` (React Frontend)
     - `trading-dashboard` (Streamlit Dashboard)

3. **Set Environment Variables**:
   - For each service, go to Environment tab
   - Add the required environment variables listed above

### 3. Service Configuration

#### Trading LLM Backend Service

- **Type**: Web Service
- **Environment**: Python 3.11
- **Plan**: Starter (free tier)
- **Build Command**: `cd trading_llm && pip install -r requirements.txt`
- **Start Command**: `cd trading_llm && gunicorn --bind 0.0.0.0:$PORT --workers 4 --timeout 120 app:app`
- **Health Check**: `/health`

#### Frontend Service

- **Type**: Static Site
- **Environment**: Static
- **Plan**: Starter (free tier)
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `./dist`

#### Streamlit Dashboard (Optional)

- **Type**: Web Service
- **Environment**: Python 3.11
- **Plan**: Starter (free tier)
- **Build Command**: `cd trading_llm && pip install -r requirements.txt`
- **Start Command**: `cd trading_llm && streamlit run streamlit_app.py --server.port=$PORT --server.address=0.0.0.0`

## 🔧 Configuration Details

### Backend Configuration

- **Port**: Uses Render's `$PORT` environment variable
- **Workers**: 4 Gunicorn workers for better performance
- **Timeout**: 120 seconds for long-running requests
- **Health Check**: Available at `/health` endpoint

### Frontend Configuration

- **Build Tool**: Vite
- **Output**: Static files in `./dist`
- **Environment**: Production build

### Database (Optional)

If you need a PostgreSQL database, uncomment the database section in `render.yaml`:

```yaml
databases:
  - name: alphaforge-db
    plan: starter
    databaseName: alphaforge
    user: alphaforge_user
```

## 🌐 Accessing Your Services

After deployment, you'll get URLs like:

- **Backend API**: `https://trading-llm-backend.onrender.com`
- **Frontend**: `https://alphaforge-frontend.onrender.com`
- **Dashboard**: `https://trading-dashboard.onrender.com`

## 📊 Monitoring

### Health Checks

- Backend health check: `GET /health`
- Returns service status and timestamp
- Monitors Supabase, Gemini, and Market Service availability

### Logs

- Access logs in Render dashboard
- Backend logs include Gunicorn and application logs
- Frontend logs show build and deployment status

## 🔄 Auto-Deployment

- **Enabled**: Services auto-deploy on `main` branch pushes
- **Manual Deploy**: Available in Render dashboard
- **Rollback**: Previous deployments can be restored

## 💰 Cost Considerations

### Free Tier Limits

- **Web Services**: 750 hours/month
- **Static Sites**: Unlimited
- **Sleep**: Services sleep after 15 minutes of inactivity
- **Cold Start**: ~30 seconds for sleeping services

### Upgrading

- **Starter Plan**: $7/month per service
- **Professional Plan**: $25/month per service
- **Enterprise**: Custom pricing

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**:

   - Check Python version (3.11.0)
   - Verify all dependencies in `requirements.txt`
   - Check build logs for specific errors

2. **Runtime Errors**:

   - Verify environment variables are set
   - Check service logs for error details
   - Ensure API keys are valid

3. **Health Check Failures**:

   - Verify all required environment variables
   - Check if external services (Supabase, Gemini) are accessible
   - Review service logs for connection errors

4. **Frontend Build Issues**:
   - Ensure all dependencies are in `package.json`
   - Check if build command completes successfully
   - Verify static files are generated in `./dist`

### Debug Commands

```bash
# Check backend health
curl https://your-backend-url.onrender.com/health

# Check if services are running
curl https://your-backend-url.onrender.com/api/status
```

## 📝 Environment Variables Reference

### Backend (.env or Render Environment)

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
FINNHUB_API_KEY=your_finnhub_api_key
FLASK_ENV=production
FLASK_DEBUG=False
```

### Frontend (Vite Environment)

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=https://your-backend-url.onrender.com
```

## 🎯 Next Steps

1. **Deploy**: Follow the deployment steps above
2. **Test**: Verify all services are working
3. **Monitor**: Set up monitoring and alerts
4. **Scale**: Upgrade plans as needed
5. **Custom Domain**: Add custom domain in Render dashboard

## 📞 Support

- **Render Documentation**: [render.com/docs](https://render.com/docs)
- **Render Support**: Available in dashboard
- **Community**: [Render Community Forum](https://community.render.com)

---

**Happy Trading! 🚀📈**
