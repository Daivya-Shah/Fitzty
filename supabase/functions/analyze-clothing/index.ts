import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('=== Analyze Clothing Function Called ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Parsing request body...');
    const requestBody = await req.json();
    console.log('Request body keys:', Object.keys(requestBody));
    console.log('Request body size:', JSON.stringify(requestBody).length);
    
    const { imageUrl, action, testMode, simpleTest } = requestBody;
    console.log(`Processing ${action} for image: ${imageUrl ? 'provided' : 'not provided'}, testMode: ${testMode}, simpleTest: ${simpleTest}`);

    // Simple test - just return success
    if (simpleTest) {
      console.log('Running simple test...');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Function is working correctly' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Test mode - just check if OpenAI API key works
    if (testMode) {
      console.log('Running in test mode...');
      const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
      if (!openAIApiKey) {
        return new Response(
          JSON.stringify({ error: 'OpenAI API key not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Simple test call
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Say "Test successful"' }],
          max_tokens: 20
        })
      });

      const data = await response.json();
      console.log('Test response:', data);

      if (!response.ok) {
        return new Response(
          JSON.stringify({ error: `OpenAI API error: ${data.error?.message || 'Unknown error'}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: data.choices[0].message.content 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!imageUrl) {
      console.error('No imageUrl provided');
      return new Response(
        JSON.stringify({ error: 'No imageUrl provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!action) {
      console.error('No action provided');
      return new Response(
        JSON.stringify({ error: 'No action provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Image URL length:', imageUrl.length);
    console.log('Image URL starts with:', imageUrl.substring(0, 50));

    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let prompt = '';
    if (action === 'generate_replica') {
      prompt = `Create an exact visual replica of the clothing item shown in this image. Match every detail including color, pattern, style, fit, and any decorative elements. The output should look identical to the input clothing item.`;
    } else if (action === 'analyze_description') {
      prompt = `Analyze this clothing item and provide an extremely detailed description that would allow someone to recreate it exactly. Include: exact colors, fabric texture, style details, patterns, fit, any logos or decorative elements, construction details, and any unique features. Be precise and comprehensive.`;
    } else if (action === 'detect_type') {
      prompt = `Analyze this clothing item and identify its specific type (e.g., t-shirt, hoodie, jeans, dress shirt, blazer, etc.). Respond with just the clothing type in lowercase.`;
    } else {
      console.error('Invalid action:', action);
      return new Response(
        JSON.stringify({ error: 'Invalid action provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Calling OpenAI GPT-4 Vision API...');
    const gptRequestBody = {
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
    };
    console.log('GPT-4 Vision request body size:', JSON.stringify(gptRequestBody).length);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(gptRequestBody)
    });

    const data = await response.json();
    console.log('GPT-4 Vision response status:', response.status);
    console.log('GPT-4 Vision response data:', data);
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${data.error?.message || 'Unknown error'}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid GPT-4 response structure:', data);
      return new Response(
        JSON.stringify({ error: 'Invalid response from OpenAI API' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = data.choices[0].message.content;
    console.log('GPT-4 Vision result:', result);

    if (action === 'generate_replica') {
      console.log('Generating image replica with DALL-E...');
      
      // Generate image replica using DALL-E 3 for better quality
      const dallERequestBody = {
        model: 'dall-e-3',
        prompt: `Create an exact replica of this clothing item: ${result}. Make it look identical in style, color, pattern, and design details.`,
        n: 1,
        size: '1024x1024',
        quality: 'standard'
      };
      console.log('DALL-E request body:', dallERequestBody);
      
      const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dallERequestBody)
      });

      const imageData = await imageResponse.json();
      console.log('DALL-E response status:', imageResponse.status);
      console.log('DALL-E response data:', imageData);
      
      if (!imageResponse.ok) {
        console.error('DALL-E API error:', imageData);
        return new Response(
          JSON.stringify({ error: `DALL-E API error: ${imageData.error?.message || 'Unknown error'}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!imageData.data || !imageData.data[0] || !imageData.data[0].url) {
        console.error('No image URL in DALL-E response:', imageData);
        return new Response(
          JSON.stringify({ error: 'No image URL received from DALL-E' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Fetch the image and convert to base64
      const generatedImageUrl = imageData.data[0].url;
      console.log('Generated image URL:', generatedImageUrl);
      
      const imageBlob = await fetch(generatedImageUrl);
      
      if (!imageBlob.ok) {
        console.error('Failed to fetch generated image, status:', imageBlob.status);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch generated image' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const imageBuffer = await imageBlob.arrayBuffer();
      
      function uint8ToString(u8a: Uint8Array) {
        let CHUNK_SZ = 0x8000;
        let c = [];
        for (let i = 0; i < u8a.length; i += CHUNK_SZ) {
          c.push(String.fromCharCode.apply(null, Array.from(u8a.subarray(i, i + CHUNK_SZ))));
        }
        return c.join("");
      }
      
      const binaryString = uint8ToString(new Uint8Array(imageBuffer));
      const base64Image = btoa(binaryString);
      
      console.log('Successfully generated and converted image');
      console.log('=== Analyze Clothing Function Completed Successfully ===');
      
      return new Response(JSON.stringify({ 
        imageUrl: `data:image/png;base64,${base64Image}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('=== Analyze Clothing Function Completed Successfully ===');
    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('=== Analyze Clothing Function Error ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});