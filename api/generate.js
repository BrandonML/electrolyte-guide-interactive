// Vercel will automatically turn this file into a serverless function
// located at /api/generate

export default async function handler(request, response) {
  // 1. We only want to handle POST requests, reject others
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  // 2. Get the Google Gemini API Key from environment variables
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return response.status(500).json({ message: 'API key not configured' });
  }

  // 3. Construct the secure API endpoint
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;

  try {
    // 4. Forward the client's request payload to the Gemini API
    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request.body), // Pass the client's payload
    });

    if (!geminiResponse.ok) {
      // If Google's API returns an error, forward it to the client
      const errorData = await geminiResponse.json();
      console.error('Gemini API Error:', errorData);
      return response.status(geminiResponse.status).json(errorData);
    }

    // 5. Stream the response from Gemini back to our client
    const data = await geminiResponse.json();
    return response.status(200).json(data);

  } catch (error) {
    console.error('Internal Server Error:', error);
    return response.status(500).json({ message: 'An internal error occurred.' });
  }
}