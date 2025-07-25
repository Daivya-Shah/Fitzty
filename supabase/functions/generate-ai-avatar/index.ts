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
    const { bodyDetails } = await req.json();

    const prompt = `Create a professional portrait photo of a person with the following characteristics: 
Gender: ${bodyDetails.gender}, 
Skin tone: ${bodyDetails.skinTone}, 
Face shape: ${bodyDetails.faceShape}, 
Hair type: ${bodyDetails.hairType}, 
Hair length: ${bodyDetails.hairLength}, 
Hair color: ${bodyDetails.hairColor}, 
Eye shape: ${bodyDetails.eyeShape}, 
Eye color: ${bodyDetails.eyeColor}, 
Body build: ${bodyDetails.bodyBuild}, 
Height: ${bodyDetails.height}, 
Weight: ${bodyDetails.weight}. 
Professional headshot style, clean background, good lighting, looking directly at camera.`;

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'dall-e-2',
        prompt: prompt,
        n: 1,
        size: '512x512',
        quality: 'standard'
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to generate avatar');
    }

    // Fetch the image from OpenAI's URL to avoid CORS issues
    const imageUrl = data.data[0].url;
    const imageResponse = await fetch(imageUrl);
    
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch generated image');
    }
    
    // Convert to base64 safely (chunked)
    const imageBuffer = await imageResponse.arrayBuffer();
    function uint8ToString(u8a) {
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
  } catch (error) {
    console.error('Error in generate-ai-avatar function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});