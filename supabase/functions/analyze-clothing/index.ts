import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, action } = await req.json();

    let prompt = '';
    if (action === 'generate_replica') {
      prompt = `Create an exact visual replica of the clothing item shown in this image. Match every detail including color, pattern, style, fit, and any decorative elements. The output should look identical to the input clothing item.`;
    } else if (action === 'analyze_description') {
      prompt = `Analyze this clothing item and provide an extremely detailed description that would allow someone to recreate it exactly. Include: exact colors, fabric texture, style details, patterns, fit, any logos or decorative elements, construction details, and any unique features. Be precise and comprehensive.`;
    } else if (action === 'detect_type') {
      prompt = `Analyze this clothing item and identify its specific type (e.g., t-shirt, hoodie, jeans, dress shirt, blazer, etc.). Respond with just the clothing type in lowercase.`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        max_tokens: action === 'detect_type' ? 50 : 500
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to analyze clothing');
    }

    const result = data.choices[0].message.content;

    if (action === 'generate_replica') {
      // Generate image replica using DALL-E
      const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'dall-e-2',
          prompt: result,
          n: 1,
          size: '512x512'
        })
      });

      const imageData = await imageResponse.json();
      
      if (!imageResponse.ok) {
        throw new Error(imageData.error?.message || 'Failed to generate replica');
      }

      // Fetch the image and convert to base64
      const generatedImageUrl = imageData.data[0].url;
      const imageBlob = await fetch(generatedImageUrl);
      const imageBuffer = await imageBlob.arrayBuffer();
      
      function uint8ToString(u8a: Uint8Array) {
        let CHUNK_SZ = 0x8000;
        let c = [];
        for (let i = 0; i < u8a.length; i += CHUNK_SZ) {
          c.push(String.fromCharCode.apply(null, u8a.subarray(i, i + CHUNK_SZ)));
        }
        return c.join("");
      }
      
      const binaryString = uint8ToString(new Uint8Array(imageBuffer));
      const base64Image = btoa(binaryString);
      
      return new Response(JSON.stringify({ 
        imageUrl: `data:image/png;base64,${base64Image}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-clothing function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});