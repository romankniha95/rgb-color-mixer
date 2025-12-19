/**
 * Cloudflare Worker for RGB Color Mixer AI API
 * Deploy this to Cloudflare Workers
 */

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    })
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }

  try {
    const { colorHex, colorRgb, language } = await request.json()

    // Get API key from environment variable
    const apiKey = API_KEY // Set this in Cloudflare Worker secrets

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://your-github-username.github.io', // Replace with your GitHub Pages URL
        'X-Title': 'RGB Color Mixer'
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
    })

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`)
    }

    const result = await response.json()

    return new Response(JSON.stringify({
      response: result.choices && result.choices[0] && result.choices[0].message
        ? result.choices[0].message.content
        : 'Sorry, I could not generate a response.'
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })

  } catch (error) {
    console.error('Worker error:', error)
    return new Response(JSON.stringify({
      error: 'An error occurred while processing your request'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
}
