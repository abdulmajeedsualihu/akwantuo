import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const groqKey = Deno.env.get("GROQ_API_KEY");
    const { guideName, location, category, description } = await req.json();

    const systemPrompt = `You are a viral marketing expert specialized in tourism across Ghana.
Your job is to write a high-conversion, catchy, and exciting WhatsApp status / social media promotional post for a local tour guide.

GUIDE INFO:
- Name: ${guideName}
- Location: ${location}
- Specialty: ${category}
- Bio/Details: ${description}

POST REQUIREMENTS:
1. Use a mix of professional and "vibe-check" language (modern, fun).
2. Include relevant emojis (African flags, sparkles, cameras, hiking boots, etc.).
3. Start with a hook (e.g., "Ready for an unforgettable Accra adventure? 🇬🇭").
4. Highlight why this guide is the best (expert knowledge, hidden gems).
5. Add a clear CTA (Call to Action) telling people to message on WhatsApp to book.
6. Keep it concise enough for a WhatsApp status (under 500 characters).
7. Respond ONLY with the text of the post. No explanations.`;

    let promoPost = "";

    if (groqKey) {
      try {
        const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${groqKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: "Write the promo post now." },
            ],
            temperature: 0.8,
          }),
        });

        if (r.ok) {
          const data = await r.json();
          promoPost = data.choices[0].message.content.trim();
        }
      } catch (e) {
        console.error("Groq error:", e);
      }
    }

    if (!promoPost) {
      promoPost = `✨ Ready to experience ${location} like a local? 🇬🇭\n\nJoin me, ${guideName}, for an exclusive ${category} experience! We'll explore hidden gems and create memories that last a lifetime. 📸\n\nLimited spots available for next week! 🗓️\n\n👇 Message me now to book your spot! #Akwantuo #VisitGhana #LocalExpert`;
    }

    return new Response(JSON.stringify({ promoPost }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-promo-post error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
