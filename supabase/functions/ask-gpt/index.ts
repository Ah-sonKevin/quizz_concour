import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import OpenAI from 'npm:openai@4.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    console.log('Request body:', body)

    // Validate input
    if (!body.question || !body.context) {
      throw new Error('Missing required fields: question and context')
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    })

    // Make request to OpenAI using the correct method name
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Tu es un assistant pédagogique qui aide les étudiants à préparer le concour d'administrateur de musée  &é à comprendre le contenu suivant : ${body.context}. Donne des détails et des exemples concrets pour expliquer le contenu. Sois factuel, cite des sources fiables (site de muséee, du gouvernement, etc ...) )`,
        },
        {
          role: 'user',
          content: body.question,
        },
      ],
      temperature: 0.6,
    })

    // Get the response
    const response = completion.choices[0].message.content

    return new Response(
      JSON.stringify({ response }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    // Add more detailed error logging
    console.error('Detailed error:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      cause: error.cause
    })

    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.toString(),
        type: error.constructor.name
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
