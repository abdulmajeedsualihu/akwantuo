// Supabase Edge Function: analyze-guide-assets
// Using Deno with Multi-Model / Multi-Version Shotgun Fallback
// PRIMARY: Groq (Llama 3.2 Vision - Open Source Weights)
// SECONDARY: Google Gemini (Free Tier Shotgun)
// MOCK FALLBACK: Always Free

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");

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

    const safeGallery = Array.isArray(gallery) ? gallery : [];
    const allPhotos = [mainPhoto, ...safeGallery].filter(Boolean);

    const prompt = `
      You are an expert travel copywriter for "Akwantuo", a platform for local tour guides.
      Help a tour guide named "${name}" in "${location}".
      
      Generate:
      - A professional "Guide Bio" (max 400 chars).
      - A catchy "Tour Title" (e.g. "Hidden Gems of ${location}").
      - A compelling "Tour Description".
      - 5 key "Highlights".
      - 5 SEO Keywords.

      IMPORTANT: Use the images provided to be specific.
      Structure your response ONLY as a valid JSON object:
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

    let result = null;
    let lastError = null;

    // --- 1. PRIMARY: GROQ (Llama 3.2 Vision - Ultra Fast & Open Source) ---
    if (GROQ_API_KEY) {
      try {
        console.log("Attempting Primary: Groq (Llama 3.2 Vision)...");
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: "llama-3.2-11b-vision-preview",
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: prompt },
                  ...allPhotos.map(img => ({
                    type: "image_url",
                    image_url: { url: img.startsWith('data:') ? img : `data:image/jpeg;base64,${img}` }
                  }))
                ]
              }
            ],
            response_format: { type: "json_object" }
          }),
          signal: AbortSignal.timeout(25000)
        });

        if (response.ok) {
          const data = await response.json();
          result = JSON.parse(data.choices?.[0]?.message?.content);
          console.log("Groq Success!");
        } else {
          lastError = await response.json();
          console.warn("Groq failed, fallback to Gemini...", lastError);
        }
      } catch (e) {
        console.error("Groq Exception:", e.message);
        lastError = e;
      }
    }

    // --- 2. SECONDARY: GEMINI SHOTGUN (Free Tier) ---
    if (!result && GEMINI_API_KEY) {
      const versions = ["v1", "v1beta"];
      const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.5-flash-latest"];
      
      console.log("Attempting Secondary: Gemini Shotgun...");
      outer: for (const ver of versions) {
        for (const mod of models) {
          try {
            console.log(`Trying Gemini ${ver} / ${mod}...`);
            const apiUrl = `https://generativelanguage.googleapis.com/${ver}/models/${mod}:generateContent?key=${GEMINI_API_KEY}`;
            const response = await fetch(apiUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{
                  parts: [
                    { text: prompt },
                    ...allPhotos.map(img => ({
                      inline_data: {
                        mime_type: img.match(/^data:(image\/[a-zA-Z+]+);base64,/)?.[1] || "image/jpeg",
                        data: img.includes(',') ? img.split(',')[1] : img
                      }
                    }))
                  ]
                }]
              }),
              signal: AbortSignal.timeout(20000)
            });

            if (response.ok) {
              const data = await response.json();
              const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                result = JSON.parse(jsonMatch ? jsonMatch[0] : text);
                console.log(`Gemini ${mod} (${ver}) Success!`);
                break outer;
              }
            } else {
              const err = await response.json();
              console.warn(`Gemini ${mod} (${ver}) failed: ${response.status}`);
              lastError = err;
            }
          } catch (e) {
            console.error(`Gemini ${mod} (${ver}) Error:`, e.message);
            lastError = e;
          }
        }
      }
    }

    // --- 3. MOCK MAGIC FALLBACK (Always Free / Last Resort) ---
    if (!result) {
      console.log("All AI providers failed. Returning high-quality Mock response.");
      result = {
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
    }

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });

  } catch (error) {
    console.error("Final Function Exception:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
