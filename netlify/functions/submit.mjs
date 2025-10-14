import fetch from 'node-fetch';

// In-memory rate limiting
const rateLimitCache = new Map();

export async function handler(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // 1. Verify JWT Token
    const authHeader = event.headers.authorization;
    if (!authHeader) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'No authorization token' })
      };
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': supabaseKey
      }
    });

    if (!userResponse.ok) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid token' })
      };
    }

    const user = await userResponse.json();

    // 2. RATE LIMITING (THIS IS THE KEY PART)
    const RATE_LIMIT_SECONDS = 60; // 1 submission per 60 seconds
    const now = Date.now();
    const lastSubmit = rateLimitCache.get(user.id);

    if (lastSubmit && (now - lastSubmit) < RATE_LIMIT_SECONDS * 1000) {
      const waitTime = Math.ceil((RATE_LIMIT_SECONDS * 1000 - (now - lastSubmit)) / 1000);
      console.log('⏱️ Rate limit hit for user:', user.email);
      return {
        statusCode: 429, // Too Many Requests
        headers,
        body: JSON.stringify({ 
          error: `Please wait ${waitTime} seconds before submitting again`
        })
      };
    }

    // 3. Validate Input
    const body = JSON.parse(event.body);
    const name = String(body.name || '').trim().substring(0, 500);
    const wallet = String(body.wallet || '').trim().substring(0, 500);
    const link = String(body.link || '').trim().substring(0, 1000);

    if (!name || !wallet || !link) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'All fields are required' })
      };
    }

    if (wallet.length < 20) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid wallet address' })
      };
    }

    if (!link.startsWith('http://') && !link.startsWith('https://')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Link must start with http:// or https://' })
      };
    }

    // 4. Submit to Google Sheets
    const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
    const sheetResponse = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        user_email: user.email,
        name: name,
        wallet: wallet,
        link: link
      })
    });

    if (!sheetResponse.ok) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to save submission' })
      };
    }

    // 5. UPDATE RATE LIMIT CACHE (Important!)
    rateLimitCache.set(user.id, now);

    // Clean up old entries to prevent memory leak
    if (rateLimitCache.size > 1000) {
      const oldestAllowed = now - RATE_LIMIT_SECONDS * 1000;
      for (const [userId, timestamp] of rateLimitCache.entries()) {
        if (timestamp < oldestAllowed) {
          rateLimitCache.delete(userId);
        }
      }
    }

    console.log('✅ Submission successful for:', user.email);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
}
