import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const groqKey = Deno.env.get("GROQ_API_KEY");
    const { touristName, touristInterest, tourDate, guideName, guideCategory, location } = await req.json();

    const systemPrompt = `You are a professional, warm, and highly-rated tour guide in Ghana named ${guideName}. 
You are responding to a new booking inquiry from ${touristName} who is interested in ${touristInterest || 'exploring Ghana'}.
The tour is tentatively scheduled for ${tourDate || 'soon'}.

GOAL:
Draft a high-conversion, friendly WhatsApp/message reply that:
1. Greets them warmly (optional use of 'Akwaaba').
2. Confirms your availability and excitement for their specific interest (${touristInterest}).
3. Mentions one specific thing they'll love about ${location || 'Ghana'}.
4. Encourages them to ask any questions to finalize the plan.
5. Keeps it concise (under 80 words) and professional yet personal.

Respond ONLY with the text of the message. No preamble or quotes.`;

    let reply = "";

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
              { role: "user", content: `Draft the reply for ${touristName} now.` },
            ],
            temperature: 0.8,
          }),
          signal: AbortSignal.timeout(15000),
        });

        if (r.ok) {
          const data = await r.json();
          reply = data.choices[0].message.content.trim();
        } else {
          console.warn("Groq failed:", await r.text());
        }
      } catch (e) {
        console.error("Groq exception:", e.message);
      }
    }

    // Fallback if AI fails or key is missing
    if (!reply) {
      reply = `Akwaaba ${touristName}! 🇬🇭 This is ${guideName}, your guide. I'm so excited you're interested in ${touristInterest || 'touring with me'}. I'm available on ${tourDate || 'those dates'} and would love to show you the best of our culture and hidden gems. Do you have any specific questions before we finalize the plan?`;
    }

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-guide-reply error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
