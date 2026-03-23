// Supabase Edge Function: analyze-guide-assets
// Using Deno and Google Gemini API

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
      }
    });
  }

  try {
    const body = await req.json();
    const { name, location, mainPhoto, gallery } = body;

    if (!mainPhoto) {
      throw new Error("Missing main photo in request body");
    }

    const safeGallery = Array.isArray(gallery) ? gallery : [];

    console.log(`Processing AI analysis for: ${name} in ${location}`);

    const prompt = `
      You are an expert travel copywriter and SEO specialist for "Akwantuo", a platform for local tour guides.
      Your goal is to help a tour guide named "${name}" in "${location}" compete with platforms like TripAdvisor.

      Use the following visual context (provided as images) to identify specific landmarks, activities, and the unique vibe of their tours.
      
      Identify:
      1. Specific landmarks (e.g. Cape Coast Castle, Kakum Canopy Walk).
      2. Activities (e.g. historical storytelling, traditional cooking, hiking).
      3. Tone of voice (e.g. educational, adventurous, warm and personal).

      Then, generate:
      - A professional, high-converting "Guide Bio" (max 400 chars).
      - A catchy, SEO-optimized "Tour Title" (e.g. "Hidden Gems of ${location}: A Local Journey").
      - A compelling "Tour Description" that uses high-intent keywords tourists actually search for.
      - 5-7 key "Highlights" of the experience.
      - 5 SEO Keywords (e.g. "authentic Ghana food tour").

      Structure your response as a valid JSON object:
      {
        "bio": "...",
        "location_suggestion": "${location}",
        "tour": {
          "title": "...",
          "description": "...",
          "highlights": ["...", "..."],
          "price_suggestion": "45.00"
        },
        "seo_keywords": ["...", "..."]
      }
    `;

    // Real Gemini API Call
    if (GEMINI_API_KEY) {
      console.log("Calling Gemini API with real key...");

      const getMimeType = (dataUrl: string) => {
        const match = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,/);
        return match ? match[1] : "image/jpeg";
      };

      const imageParts = [
        { 
          inline_data: { 
            mime_type: getMimeType(mainPhoto), 
            data: mainPhoto.includes(',') ? mainPhoto.split(',')[1] : mainPhoto 
          } 
        },
        ...safeGallery.map(img => ({ 
          inline_data: { 
            mime_type: getMimeType(img), 
            data: img.includes(',') ? img.split(',')[1] : img 
          } 
        }))
      ];

      let response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              ...imageParts
            ]
          }]
        })
      });

      if (!response.ok) {
        const firstErrorData = await response.json();
        console.error("Primary Gemini API Error:", firstErrorData);
        
        // Diagnostic: List models if 404
        if (response.status === 404) {
          console.log("Model not found. Attempting diagnostics...");
          const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
          const listRes = await fetch(listUrl);
          if (listRes.ok) {
            const listData = await listRes.json();
            console.log("Available Models in this key:", listData.models?.map((m: any) => m.name).join(", "));
          }
        }

        throw new Error(`AI API error: ${JSON.stringify(firstErrorData)}`);
      }

      const geminiData = await response.json();

      if (!geminiData.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.error("Unexpected AI Response:", geminiData);
        throw new Error("AI returned an empty or malformed response");
      }

      const generatedText = geminiData.candidates[0].content.parts[0].text;
      console.log("Raw Generated Text:", generatedText);

      try {
        // Extract JSON from potential Markdown formatting
        const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
        const result = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(generatedText);

        return new Response(JSON.stringify(result), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        throw new Error(`Failed to parse AI response as JSON. Raw output: ${generatedText.substring(0, 500)}`);
      }
    }

    console.log("No GEMINI_API_KEY found, returning mock response");
    // Fallback Mock Response
    const mockResult = {
      bio: `Hi, I'm ${name}! I'm passionate about showing you the true heart of ${location}. From hidden historical sites to the best local street food, I'll make sure your journey is unforgettable and authentic.`,
      location_suggestion: location,
      tour: {
        title: `Authentic ${location} Discovery Tour`,
        description: `Join me for a deep dive into the culture and history of ${location}. We'll visit the most iconic landmarks and discover hidden spots that only locals know. Perfect for travelers seeking a genuine Ghanaian experience.`,
        highlights: ["Personalized itinerary", "Historical insights", "Local food tasting", "Expert storytelling"],
        price_suggestion: "50.00"
      },
      seo_keywords: [`${location} tour`, "Ghana local guide", "authentic travel", "cultural experience"]
    };

    return new Response(JSON.stringify(mockResult), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });

  } catch (error) {
    console.error("Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
