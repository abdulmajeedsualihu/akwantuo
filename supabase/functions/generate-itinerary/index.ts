import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const INTEREST_ACTIVITIES: Record<string, string[]> = {
  culture: [
    "Visit a traditional chief's palace",
    "Explore the National Museum of Ghana",
    "Attend a local kente weaving demonstration",
    "Walk through the historic district",
    "Experience a traditional drumming & dance performance",
  ],
  nature: [
    "Hike through Kakum National Park canopy walkway",
    "Visit Mole National Park for wildlife spotting",
    "Boat ride on Volta Lake",
    "Explore Boti Falls",
    "Sunset walk at the Shai Hills Resource Reserve",
  ],
  food: [
    "Morning street food tour — kelewele, koose & fresh coconut",
    "Cook a traditional Ghanaian meal with a local family",
    "Visit the central market for spices & fresh produce",
    "Fufu & light soup lunch at a local chop bar",
    "Explore night food market for grilled tilapia & banku",
  ],
  nightlife: [
    "Experience highlife music at a local spot",
    "Azonto dance class with local youth",
    "Evening at a beachside bar in Labadi",
    "Afrobeats night at a curated local venue",
    "Live drumming circle in the community",
  ],
  adventure: [
    "ATV ride through the bush",
    "Kayaking on the Volta River",
    "Rock climbing at Shai Hills",
    "Waterfall cliff jumping at Wli Falls",
    "Off-road 4x4 tour to remote villages",
  ],
};

const VIBE_TIPS: Record<string, string[]> = {
  relaxed: [
    "Take breaks often — Ghana's heat can be intense.",
    "Plan for 'Ghana Time' — things often run 30 mins late, and that's perfectly fine.",
    "Always carry water and light snacks.",
  ],
  local: [
    "Learn to say 'Akwaaba' (welcome) — locals will love it.",
    "Use local trotros for an authentic commute experience.",
    "Shop at open-air markets instead of malls for better prices and experiences.",
  ],
  luxury: [
    "Book restaurant reservations in advance at the trendy spots.",
    "Hire a private driver for comfortable inter-city travel.",
    "Ask your guide about VIP experiences at cultural sites.",
  ],
  hustle: [
    "Start every day by 7am to beat the heat and traffic.",
    "Pre-book all sites and tours online where possible.",
    "Pack a detailed agenda but stay flexible for spontaneous discoveries.",
  ],
};

const buildMockItinerary = (preferences: any, guide: any): object => {
  const { interests = [], vibe = "local", traveler = "solo", location = "Ghana" } = preferences;
  const guideName = guide?.name || "Your Guide";
  const days = preferences.days || 3;

  const activityPool: string[] = interests.flatMap(
    (i: string) => INTEREST_ACTIVITIES[i] ?? []
  );

  // Shuffle and chunk activities into days
  const shuffled = activityPool.sort(() => Math.random() - 0.5);
  const itineraryDays = Array.from({ length: days }, (_, i) => {
    const base = i * 3;
    return {
      day: i + 1,
      title: i === 0 ? `Arrival & First Tastes of ${location}` : i === days - 1 ? `Final Memories & Farewell` : `Exploring ${location} — Day ${i + 1}`,
      morning: shuffled[base] || `Morning orientation walk with ${guideName}`,
      afternoon: shuffled[base + 1] || `Curated local lunch and cultural immersion`,
      evening: shuffled[base + 2] || `Sunset at a scenic viewpoint followed by dinner`,
    };
  });

  const vibeSpecificTips = VIBE_TIPS[vibe] ?? VIBE_TIPS.local;
  const tips = [
    ...vibeSpecificTips,
    traveler === "family" ? "Keep a list of child-friendly spots — your guide can filter these." : null,
    traveler === "couple" ? "Ask your guide about romantic sunset spots and candlelit dining." : null,
    `${guideName} is your local expert — don't hesitate to ask them any question.`,
    "Respect local customs: always greet elders first; ask before photographing people.",
    "Ghana's mobile network is excellent — get a local SIM for cheap data.",
  ].filter(Boolean) as string[];

  return {
    title: `Your ${days}-Day ${location} Adventure`,
    subtitle: `Crafted by Akwantuo AI · Curated with ${guideName}`,
    days: itineraryDays,
    tips,
  };
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const groqKey = Deno.env.get("GROQ_API_KEY");
    const { preferences, guide } = await req.json();

    const location = preferences?.location ?? "Ghana";
    const interests = (preferences?.interests ?? []).join(", ") || "local culture";
    const vibe = preferences?.vibe ?? "local";
    const traveler = preferences?.traveler ?? "solo";
    const priceRange = preferences?.priceRange ?? "mid";
    const days = preferences?.days ?? 3;
    const guideName = guide?.name ?? "your guide";
    const guideLocation = guide?.location ?? location;
    const guideBio = guide?.bio ?? "";

    const systemPrompt = `You are the Akwantuo Trip Planner — an expert on travel across Ghana.
Generate a realistic, genuinely useful ${days}-day travel itinerary for a ${traveler} traveler visiting ${location} (or nearby ${guideLocation}).

TOURIST PROFILE:
- Interests: ${interests}
- Travel Vibe: ${vibe}
- Budget: ${priceRange}
- Traveling as: ${traveler}

MATCHED GUIDE:
- Name: ${guideName}
- Location: ${guideLocation}
- Bio: ${guideBio}

RULES:
1. All activities must be real, specific places or experiences in Ghana.
2. Morning = exploration/activities, Afternoon = food/culture, Evening = social/relaxation.
3. Weave the guide's specialties naturally into Day 1.
4. Provide 5 practical "Local Tips" relevant to this traveler's vibe and type.
5. Respond ONLY as a valid JSON object matching this schema exactly:

{
  "title": "Your 3-Day Accra Adventure",
  "subtitle": "Crafted by Akwantuo AI · Curated with [guide name]",
  "days": [
    {
      "day": 1,
      "title": "Arrival & First Tastes of Accra",
      "morning": "string — specific activity with location name",
      "afternoon": "string — specific activity with location name",
      "evening": "string — specific activity with location name"
    }
  ],
  "tips": ["tip 1", "tip 2", "tip 3", "tip 4", "tip 5"]
}`;

    let itinerary = null;

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
              { role: "user", content: `Generate the ${days}-day itinerary now.` },
            ],
            temperature: 0.7,
            response_format: { type: "json_object" },
          }),
          signal: AbortSignal.timeout(25000),
        });

        if (r.ok) {
          const data = await r.json();
          const parsed = JSON.parse(data.choices[0].message.content);
          if (parsed?.days?.length > 0) {
            itinerary = parsed;
            console.log("Groq itinerary success!");
          }
        } else {
          console.warn("Groq failed:", await r.text());
        }
      } catch (e) {
        console.error("Groq exception:", e.message);
      }
    }

    // Fallback to deterministic mock
    if (!itinerary) {
      console.log("Using mock itinerary fallback.");
      itinerary = buildMockItinerary({ ...preferences, days }, guide);
    }

    return new Response(JSON.stringify({ itinerary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-itinerary error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
