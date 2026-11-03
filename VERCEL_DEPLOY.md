# 🚀 Deploy KiLi AGENT to Vercel

**Complete deployment guide for production**

## ✅ Prerequisites

- [x] GitHub repository: https://github.com/AkihikoIzuru/KiLi-AGENT
- [x] Vercel account (free tier works): https://vercel.com
- [x] AI endpoint URL (must be public HTTPS)
- [x] AI API key
- [x] Strong passwords for app access

---

## 🎯 Quick Deploy (5 Minutes)

### Option 1: Deploy Button (Recommended)

1. **Update README.md** - Change the deploy button URL:
   ```markdown
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAkihikoIzuru%2FKiLi-AGENT&env=AI_BASE_URL,AI_API_KEY,AI_DEFAULT_MODEL,ACCESS_PASSWORD,SESSION_SECRET&envDescription=Endpoint%20AI%2C%20API%20key%2C%20model%20default%2C%20dan%20password%20akses)
   ```

2. **Click the button** in your GitHub README
3. **Fill in environment variables** (see below)
4. **Deploy!**

### Option 2: Import from Vercel Dashboard

1. Go to https://vercel.com/new
2. Click **Import Git Repository**
3. Search for: `AkihikoIzuru/KiLi-AGENT`
4. Click **Import**
5. Configure environment variables (next section)
6. Click **Deploy**

---

## 🔐 Environment Variables

**Required for all deployments:**

### AI Configuration
```bash
AI_BASE_URL=https://your-ai-endpoint.com/v1
AI_API_KEY=sk-your-api-key-here
AI_DEFAULT_MODEL=gpt-4o-mini
```

### Security (CRITICAL!)
```bash
ACCESS_PASSWORD=your-very-strong-password-here
SESSION_SECRET=use-openssl-rand-base64-32-to-generate
```

Generate a secure session secret:
```bash
openssl rand -base64 32
```

### Optional Configuration
```bash
# Agent settings
AGENT_MAX_STEPS=10

# Web search (if using)
SEARCH_PROVIDER=tavily
SEARCH_API_KEY=tvly-your-key

# Model list override (if /models endpoint unavailable)
AI_MODELS=[{"id":"gpt-4o-mini","label":"GPT-4o Mini","vision":true,"reasoning":false,"tools":true}]

# Extra headers for AI endpoint
AI_EXTRA_HEADERS={"X-Custom-Header":"value"}
```

---

## 📋 Step-by-Step Deployment

### 1. Prepare Your AI Endpoint

**⚠️ CRITICAL: Vercel cannot access localhost or private networks!**

Your AI endpoint MUST be:
- ✅ Public HTTPS URL
- ✅ API key protected
- ✅ Supports streaming (SSE)
- ✅ OpenAI-compatible API

**Options to expose local endpoints:**

#### A. Cloudflare Tunnel (Recommended)
```bash
# Install cloudflared
# https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/

# Create tunnel
cloudflared tunnel create kili-agent

# Configure tunnel (edit config.yml)
ingress:
  - hostname: ai.yourdomain.com
    service: http://localhost:20128
  - service: http_status:404

# Run tunnel
cloudflared tunnel run kili-agent
```

#### B. Tailscale Funnel
```bash
# Enable Funnel for your service
tailscale funnel 20128
```

#### C. Use Cloud AI Provider
- OpenAI: https://api.openai.com/v1
- Anthropic: https://api.anthropic.com/v1
- OpenRouter: https://openrouter.ai/api/v1
- Groq: https://api.groq.com/openai/v1

### 2. Set Environment Variables in Vercel

**For Production:**
1. Go to your project in Vercel
2. Click **Settings** → **Environment Variables**
3. Add each variable:
   - Name: `AI_BASE_URL`
   - Value: `https://your-endpoint.com/v1`
   - Environment: **Production** ✅
4. Repeat for all required variables
5. **Important**: Also check **Preview** if you want preview deployments to work

**Pro Tip:** Use different endpoints for Preview and Production!

### 3. Configure Build Settings

Vercel auto-detects Next.js, but verify:

```json
// vercel.json (already in repo)
{
  "regions": ["sin1"],  // Singapore - close to Indonesia
  "functions": {
    "app/api/chat/route.ts": {
      "maxDuration": 60  // 60s for Pro, 10s for Hobby
    }
  }
}
```

**Upgrade to Pro** if you need:
- Longer function timeout (10s → 300s)
- More bandwidth
- Team features

### 4. Deploy!

Click **Deploy** and wait 2-3 minutes.

### 5. Verify Deployment

Once deployed, visit your URL: `https://kili-agent-xyz.vercel.app`

**Checklist:**
- [ ] Login page loads
- [ ] Can login with `ACCESS_PASSWORD`
- [ ] Model picker shows your models
- [ ] Can send message and get streaming response
- [ ] Agent mode toggle works (if model supports tools)
- [ ] Artifacts open in side panel
- [ ] Mobile responsive

---

## 🔧 Post-Deployment Configuration

### Custom Domain

1. Go to **Settings** → **Domains**
2. Add your domain: `chat.yourdomain.com`
3. Configure DNS (Vercel provides instructions)
4. SSL automatically provisioned

### Environment Updates

**After changing environment variables:**
1. Go to **Deployments**
2. Click **...** on latest deployment
3. Click **Redeploy**
4. Environment variables only apply to new deployments!

### Function Timeout (If responses get cut off)

Hobby plan: 10s max
Pro plan: 60s default, 300s max

In `vercel.json`:
```json
{
  "functions": {
    "app/api/chat/route.ts": {
      "maxDuration": 60  // Adjust based on your plan
    }
  }
}
```

---

## 🐛 Troubleshooting

### Issue: "fetch failed" or timeout errors

**Cause**: Vercel can't reach your AI endpoint

**Solutions:**
- ✅ Verify endpoint is public HTTPS (test with `curl` from another machine)
- ✅ Check firewall allows Vercel IPs
- ✅ Test endpoint from: https://reqbin.com/

### Issue: "Unauthorized" or 401 errors

**Cause**: API key mismatch

**Solutions:**
- ✅ Verify `AI_API_KEY` in Vercel matches your endpoint
- ✅ Check environment is set for Production (not just Preview)
- ✅ Redeploy after changing environment variables

### Issue: Model list is empty

**Cause**: `/models` endpoint failed or returned empty

**Solutions:**
- ✅ Manually set `AI_MODELS` environment variable
- ✅ Check endpoint `/models` returns valid response:
  ```bash
  curl https://your-endpoint.com/v1/models \
    -H "Authorization: Bearer $API_KEY"
  ```

### Issue: Stream cuts off / 504 timeout

**Cause**: Function timeout (Hobby: 10s, Pro: 60s)

**Solutions:**
- ✅ Upgrade to Vercel Pro
- ✅ Use faster model
- ✅ Reduce `AGENT_MAX_STEPS`
- ✅ Set shorter `maxTokens` in settings

### Issue: Agent mode doesn't work

**Cause**: Model doesn't support tools

**Solutions:**
- ✅ Use a model that supports function calling
- ✅ Check `AI_MODELS` has `tools: true` for your model
- ✅ Verify endpoint supports OpenAI tool calling format

### Issue: Artifacts don't display

**Cause**: Content Security Policy blocks iframe

**Solutions:**
- ✅ Already configured in `next.config.js`
- ✅ Check browser console for CSP errors
- ✅ Verify `frame-src 'self' blob:` in headers

---

## 📊 Performance Optimization

### Edge Network
Change region to closest to your users:
```json
{
  "regions": ["sin1"]  // Singapore
  // or ["sfo1"] for San Francisco
  // or ["fra1"] for Frankfurt
}
```

### Caching
Models list is cached for 5 minutes (see `lib/ai/models.ts`)

### Bundle Size
Current bundle: ~2MB (excellent for Next.js + MUI)

---

## 🔐 Security Checklist

- [ ] `ACCESS_PASSWORD` is strong (16+ characters)
- [ ] `SESSION_SECRET` is random 32+ characters
- [ ] `AI_API_KEY` is not in git (checked `.gitignore`)
- [ ] AI endpoint requires authentication
- [ ] AI endpoint is rate-limited
- [ ] Used `AI_EXTRA_HEADERS` if needed for auth
- [ ] Tested sandbox iframe is isolated
- [ ] CSP headers are active (check `next.config.js`)

---

## 📈 Monitoring

### Vercel Analytics
Enable in project settings for:
- Page views
- Response times
- Web vitals

### Function Logs
View real-time logs:
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Tail logs
vercel logs --follow
```

### Error Tracking
Consider adding:
- Sentry: https://sentry.io
- LogRocket: https://logrocket.com

---

## 🚀 Going Live Checklist

- [ ] Environment variables set in Production
- [ ] AI endpoint is public HTTPS
- [ ] Tested login works
- [ ] Tested chat streaming
- [ ] Tested agent mode
- [ ] Tested artifacts
- [ ] Tested on mobile
- [ ] Custom domain configured (optional)
- [ ] Analytics enabled
- [ ] Backup data export tested

---

## 📞 Support

**Vercel Issues:**
- Documentation: https://vercel.com/docs
- Support: https://vercel.com/support

**KiLi AGENT Issues:**
- GitHub: https://github.com/AkihikoIzuru/KiLi-AGENT/issues
- See `README.md` for troubleshooting guide

---

## 🎉 Success!

Your KiLi AGENT is now live at: `https://your-project.vercel.app`

Share the link, but remember:
- Users need the `ACCESS_PASSWORD` to login
- Data is stored client-side (IndexedDB)
- Encourage users to export data regularly

**Next Steps:**
- Add custom domain
- Configure web search
- Invite team members
- Monitor usage
- Gather feedback

Enjoy your AI assistant! 🤖✨
