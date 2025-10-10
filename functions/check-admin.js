// functions/check-admin.js
export async function handler(event, context) {
    const serviceEmail = process.env.VITE_ADMIN_EMAIL;
  
    // Get user's email from query params (or headers, whatever you use)
    const userEmail = event.queryStringParameters?.email;
  
    const isAdmin = userEmail === serviceEmail;
  
    return {
      statusCode: 200,
      body: JSON.stringify({ isAdmin }),
    };
  }
  