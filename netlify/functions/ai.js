

exports.handler = async (event, context) => {
  // Allow CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { colorHex, colorRgb, language } = JSON.parse(event.body);

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API key not configured' })
      };
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'allenai/olmo-3.1-32b-think:free',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant that knows a lot about colors. You will be given a color and you should provide a short, interesting fact or story about it. Respond in ${language === 'en' ? 'English' : 'Slovak'}.`
          },
          {
            role: 'user',
            content: `Tell me something interesting about the color with HEX code ${colorHex} (${colorRgb}).`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const result = await response.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: result.choices && result.choices[0] && result.choices[0].message
          ? result.choices[0].message.content
          : 'Sorry, I could not generate a response.'
      })
    };

  } catch (error) {
    console.error('AI Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'An error occurred while processing your request'
      })
    };
  }
};
