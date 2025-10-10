// functions/check-admin.js
export async function handler(event, context) {
    // Use non-VITE_ prefixed environment variable (server-side only)
    const adminEmail = process.env.ADMIN_EMAIL;
  
    // Get user's email from query params
    const userEmail = event.queryStringParameters?.email;
  
    if (!userEmail) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing email parameter' }),
      };
    }
  
    const isAdmin = userEmail === adminEmail;
  
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isAdmin }),
    };
  }
  