import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const groqKey = Deno.env.get("GROQ_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { userId, message, history = [] } = await req.json();

    if (!userId || !message) {
      throw new Error("Missing userId or message");
    }

    // 1. Fetch Business Context
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    const { data: storefront } = await supabase
      .from("storefronts")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    const { data: bookings } = await supabase
      .from("bookings")
      .select("*")
      .eq("guide_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    const businessContext = `
BUSINESS CONTEXT:
- Guide Name: ${profile?.display_name || "Unknown"}
- Business Name: ${storefront?.business_name || "Unknown"}
- Location: ${storefront?.location || "Unknown"}
- Category: ${storefront?.category || "Unknown"}
- Bio: ${storefront?.description || "No bio set."}
- Is Live: ${storefront?.is_live ? "Yes" : "No"}

BOOKINGS SUMMARY:
- Total Recent Bookings (last 20): ${bookings?.length || 0}
- Pending: ${bookings?.filter((b: any) => b.status === "pending").length || 0}
- Confirmed: ${bookings?.filter((b: any) => b.status === "confirmed").length || 0}
- Latest Bookings details (JSON): ${JSON.stringify(bookings?.slice(0, 5) || [])}
`;

    const systemPrompt = `You are the Akwantuo AI Business Assistant, a helpful and expert consultant for tour guides in Ghana.
Your goal is to help tour guides grow their business, manage their schedule, and provide excellent customer service.

${businessContext}

RULES:
1. Use the provided BUSINESS CONTEXT and BOOKINGS to answer questions accurately.
2. If asked about bookings, summarize them clearly.
3. If asked for growth advice, suggest improving their bio, adding highlights, or marketing themselves more.
4. Keep your tone encouraging, professional, and slightly "vibe-check" (fun but expert).
5. Be concise but helpful. Avoid long-winded corporate speak.
6. Use emojis sparingly but effectively to keep it engaging.
7. If you don't know something, be honest, but try to provide general business advice for a tour guide.
8. Respond ONLY with the assistant's message. Do NOT include preambles like "Certainly!" or "Here is your response:" or prefixes like "Assistant:".
9. Do NOT use markdown formatting (like **bolding** or *italics*). Use plain text ONLY. Avoid all asterisks.
10. Use double newlines (\n\n) between different points or paragraphs to ensure the response is well-spaced and easy to read.
11. When mentioning bookings, DO NOT show internal IDs (UUIDs) or technical timestamps. Format them in a friendly, conversational way (e.g., "Tourist Name (Phone) - Booking Date").
12. Avoid ending every message with the same generic "What's your next question?". Use varied, friendly closing phrases that sound natural.`;

    let assistantResponse = "";

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
              ...history.slice(-6), // Keep last 3 turns of context
              { role: "user", content: message },
            ],
            temperature: 0.7,
          }),
        });

        if (r.ok) {
          const data = await r.json();
          assistantResponse = data.choices[0].message.content.trim();
        } else {
          const errData = await r.text();
          console.error("Groq API error:", errData);
        }
      } catch (e) {
        console.error("Groq fetch error:", e);
      }
    }

    if (!assistantResponse) {
      assistantResponse = "I'm having a bit of a moment with my AI brain, but I'm still here! I see you have " + 
        (bookings?.length || 0) + " bookings. How specifically can I help you manage your " + 
        (storefront?.business_name || "business") + " today? 🇬🇭";
    }

    return new Response(JSON.stringify({ response: assistantResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("AI Business Assistant error:", error);
    return new Response(JSON.stringify({ error: error.message || String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
