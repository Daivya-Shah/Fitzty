import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('=== AI Avatar Function Called ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Parsing request body...');
    const requestBody = await req.json();
    console.log('Request body:', requestBody);
    
    const { bodyDetails } = requestBody;
    console.log('Extracted bodyDetails:', bodyDetails);

    if (!bodyDetails) {
      console.error('No bodyDetails provided');
      return new Response(
        JSON.stringify({ error: 'No bodyDetails provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const requiredFields = ['gender', 'skinTone', 'faceShape', 'hairType', 'hairLength', 'hairColor', 'eyeShape', 'eyeColor', 'bodyBuild', 'height', 'weight']
    console.log('Checking required fields...');
    
    for (const field of requiredFields) {
      if (!bodyDetails[field]) {
        console.error(`Missing required field: ${field}`);
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    if (bodyDetails.gender === 'Male' && !bodyDetails.beardLength) {
      console.error('Missing beardLength for male user');
      return new Response(
        JSON.stringify({ error: 'Missing required field: beardLength for male users' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('All validations passed, checking OpenAI API key...');
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    console.log('OpenAI API key found');

    let prompt = `A professional headshot portrait of a ${bodyDetails.gender.toLowerCase()} person with the following characteristics: `
    prompt += `${bodyDetails.skinTone.toLowerCase()} skin tone, ${bodyDetails.faceShape.toLowerCase()} face shape, `
    prompt += `${bodyDetails.hairType.toLowerCase()} ${bodyDetails.hairLength.toLowerCase()} ${bodyDetails.hairColor.toLowerCase()} hair, `
    prompt += `${bodyDetails.eyeShape.toLowerCase()} ${bodyDetails.eyeColor.toLowerCase()} eyes, `
    prompt += `${bodyDetails.bodyBuild.toLowerCase()} body build, `
    prompt += `${bodyDetails.height.toLowerCase()} height, ${bodyDetails.weight.toLowerCase()} weight`

    if (bodyDetails.gender === 'Male' && bodyDetails.beardLength) {
      prompt += `, ${bodyDetails.beardLength.toLowerCase()}`
    }

    prompt += `. The portrait should be a close-up headshot showing only the face and head, with a neutral expression, professional lighting, and high quality. The background should be simple and clean.`

    console.log('Generated prompt:', prompt)

    console.log('Calling OpenAI API...');
    const openAIRequestBody = {
      model: 'dall-e-2',
      prompt: prompt,
      n: 1,
      size: '512x512'
    };
    console.log('OpenAI request body:', openAIRequestBody);
    
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(openAIRequestBody)
    })

    console.log('OpenAI response status:', response.status)
    const data = await response.json()
    console.log('OpenAI response data:', data)

    if (!response.ok) {
      console.error('OpenAI API error:', data)
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${data.error?.message || 'Unknown error'}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!data.data || !data.data[0] || !data.data[0].url) {
      console.error('No image URL in OpenAI response:', data)
      return new Response(
        JSON.stringify({ error: 'No image URL received from OpenAI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const imageUrl = data.data[0].url
    console.log('Image URL received:', imageUrl)
    
    console.log('Fetching generated image...');
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      console.error('Failed to fetch generated image, status:', imageResponse.status)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch generated image' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Converting image to base64...');
    const imageBuffer = await imageResponse.arrayBuffer()
    function uint8ToString(u8a) {
      let CHUNK_SZ = 0x8000
      let c = []
      for (let i = 0; i < u8a.length; i += CHUNK_SZ) {
        c.push(String.fromCharCode.apply(null, u8a.subarray(i, i + CHUNK_SZ)))
      }
      return c.join("")
    }
    const binaryString = uint8ToString(new Uint8Array(imageBuffer))
    const base64Image = btoa(binaryString)

    console.log('Successfully generated and converted image')
    console.log('=== AI Avatar Function Completed Successfully ===');

    return new Response(JSON.stringify({
      imageUrl: `data:image/png;base64,${base64Image}`
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    })

  } catch (error) {
    console.error('=== AI Avatar Function Error ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})