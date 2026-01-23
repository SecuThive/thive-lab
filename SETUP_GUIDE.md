# Developer Center Setup Guide

## Quick Start

Follow these steps to set up the Developer Center and API routes on your ThiveLab project.

## 1. Install Dependencies

```bash
npm install @upstash/ratelimit @upstash/redis
```

✅ Already completed!

## 2. Configure Environment Variables

Add to your `.env.local`:

```env
# Upstash Redis (for API rate limiting)
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

### Get Upstash Credentials:

1. Go to [Upstash Console](https://console.upstash.com/)
2. Sign up/Login
3. Click "Create Database"
4. Choose a region close to your users
5. Copy the "REST URL" and "REST Token" from the dashboard
6. Paste them into `.env.local`

## 3. Set Up Supabase Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Execute the SQL from: supabase/steam-deals-setup.sql
```

Or copy the contents of `supabase/steam-deals-setup.sql` and run it in Supabase.

This creates:
- `steam_deals` table with proper schema
- Indexes for performance
- Row Level Security policies
- Sample data

## 4. Test Your Setup

### Test the API Endpoint

```bash
# In your terminal
npm run dev

# In another terminal or browser
curl http://localhost:3000/api/v1/steam/deals?limit=5
```

Expected response:
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "count": 5,
    "limit": 5,
    "filters": {
      "steam_deck": false,
      "min_discount": 0
    }
  }
}
```

### Test Rate Limiting

Make 11+ requests quickly:
```bash
for i in {1..12}; do curl http://localhost:3000/api/v1/steam/deals; done
```

You should see a 429 error on the 11th request.

## 5. Access Documentation

Visit in your browser:
- Main docs: http://localhost:3000/docs
- Steam API docs: http://localhost:3000/docs/steam-api

## File Structure Created

```
app/
├── api/
│   └── v1/
│       └── steam/
│           └── deals/
│               └── route.ts          # Steam Deals API endpoint
├── docs/
│   ├── layout.tsx                    # Docs sidebar & header
│   ├── page.tsx                      # Main docs landing page
│   ├── steam-api/
│   │   └── page.tsx                  # Steam API documentation
│   └── movie-api/
│       └── page.tsx                  # Movie API (coming soon)
components/
└── Navbar.tsx                         # Main navigation with "Developers" link
lib/
├── rate-limit.ts                      # Upstash rate limiting config
└── supabase.ts                        # Updated with steam_deals types
supabase/
└── steam-deals-setup.sql             # Database migration
```

## Verification Checklist

- [ ] Upstash Redis credentials added to `.env.local`
- [ ] `steam_deals` table created in Supabase
- [ ] Sample data inserted (5 games)
- [ ] Dev server running (`npm run dev`)
- [ ] API endpoint responding at `/api/v1/steam/deals`
- [ ] Rate limiting working (11th request returns 429)
- [ ] Docs accessible at `/docs`
- [ ] Navbar shows "Developers" link

## Troubleshooting

### API returns 500 error
- Check Supabase credentials in `.env.local`
- Verify `steam_deals` table exists
- Check Supabase SQL editor for errors

### Rate limiting not working
- Verify Upstash credentials in `.env.local`
- Check Upstash dashboard for connection
- Ensure Redis database is active

### Docs page not loading
- Clear Next.js cache: `rm -rf .next`
- Restart dev server: `npm run dev`

## Next Steps

1. **Customize the API**: Add more endpoints in `app/api/v1/`
2. **Add Documentation**: Create pages in `app/docs/`
3. **Update Types**: Add tables to `lib/supabase.ts`
4. **Deploy**: Push to production and test

## Production Deployment

Before deploying:

1. Add environment variables to Vercel/hosting platform:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

2. Test API in production:
   ```bash
   curl https://thivelab.com/api/v1/steam/deals?limit=5
   ```

3. Monitor rate limits in Upstash dashboard

## Support

If you encounter issues:
- Check the API_README.md for detailed documentation
- Review error logs in the console
- Test API endpoints with Postman or curl

---

**Success!** Your Developer Center is now live at `/docs` 🎉
