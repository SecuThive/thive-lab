# ThiveLab Developer Center

This directory contains the API documentation and developer resources for ThiveLab's public APIs.

## 📚 Documentation Structure

- `/docs` - Main documentation landing page
- `/docs/steam-api` - Steam Deals API documentation
- `/docs/movie-api` - Movie API documentation (coming soon)

## 🚀 Features

### Developer Documentation
- **Stripe-inspired Design**: Clean, dark-mode documentation interface
- **Interactive Code Examples**: Copy-to-clipboard functionality for all code snippets
- **Multi-language Examples**: JavaScript/TypeScript, Python, and more
- **Live API Status**: Rate limit information in response headers

### API Infrastructure
- **RESTful Design**: JSON responses, standard HTTP methods
- **Rate Limiting**: 10 requests per 10 seconds per IP (powered by Upstash Redis)
- **Edge Runtime**: Fast global response times
- **Type Safety**: Full TypeScript support

## 🔧 Setup

### Environment Variables

Add these to your `.env.local`:

```bash
# Upstash Redis (for API rate limiting)
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token
```

### Get Upstash Credentials

1. Visit [Upstash Console](https://console.upstash.com/)
2. Create a new Redis database
3. Copy the REST URL and REST Token
4. Add them to your `.env.local` file

## 📡 Available APIs

### Steam Deals API
**Endpoint**: `/api/v1/steam/deals`

Get real-time Steam game deals with filtering options.

**Query Parameters**:
- `limit` (number, 1-100): Number of results to return
- `steam_deck` (boolean): Filter for Steam Deck compatible games
- `min_discount` (number, 0-100): Minimum discount percentage

**Example**:
```javascript
fetch('https://thivelab.com/api/v1/steam/deals?limit=10&min_discount=50')
  .then(res => res.json())
  .then(data => console.log(data));
```

### Movie API (Coming Soon)
**Endpoint**: `/api/v1/movies` (planned)

## 🗄️ Database Setup

Run the SQL migration to create the `steam_deals` table:

```bash
# In your Supabase SQL editor, run:
supabase/steam-deals-setup.sql
```

This will:
- Create the `steam_deals` table with proper schema
- Add indexes for performance
- Enable Row Level Security (RLS)
- Insert sample data

## 🎨 Customization

### Adding New API Endpoints

1. Create route file: `app/api/v1/your-endpoint/route.ts`
2. Add documentation: `app/docs/your-api/page.tsx`
3. Update sidebar: `app/docs/layout.tsx`
4. Update database types: `lib/supabase.ts`

### Example API Route Template

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { ratelimit } from "@/lib/rate-limit";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  // Rate limiting
  const ip = request.ip ?? "127.0.0.1";
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429 }
    );
  }

  // Your API logic here
  const { data, error } = await supabase
    .from("your_table")
    .select("*");

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data });
}
```

## 🔒 Security

- **Rate Limiting**: Prevents API abuse
- **RLS Policies**: Database-level security
- **CORS**: Configure as needed
- **Input Validation**: All parameters are validated

## 📊 Rate Limits

Current limits:
- **Public APIs**: 10 requests per 10 seconds per IP
- **Response Headers**: Include rate limit information
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

## 🚧 Roadmap

- [ ] API Key Authentication
- [ ] Higher rate limits for authenticated users
- [ ] WebSocket support for real-time updates
- [ ] GraphQL endpoint
- [ ] SDK packages (JavaScript, Python, Go)
- [ ] Webhook support

## 📖 Documentation Pages

Visit the live documentation at:
- **Main Docs**: `https://thivelab.com/docs`
- **Steam API**: `https://thivelab.com/docs/steam-api`

## 🤝 Contributing

To add or improve documentation:

1. Edit the relevant page in `app/docs/`
2. Ensure code examples are tested
3. Update this README if adding new sections
4. Submit a pull request

## 📝 License

This project is part of ThiveLab. All rights reserved.

## 💬 Support

For API support or questions:
- Email: support@thivelab.com
- Documentation: https://thivelab.com/docs
