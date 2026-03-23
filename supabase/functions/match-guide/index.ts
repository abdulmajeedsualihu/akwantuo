import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/** Slugify a display name the same way the frontend does in share.ts */
const slugify = (name: string) =>
  (name ?? "")
    .toString()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "tour";

const GHANA_KEYWORDS = [
  "ghana", "accra", "kumasi", "cape coast", "takoradi", "tamale",
  "volta", "ashanti", "ho", "koforidua", "sunyani", "wa", "bolgatanga",
  "tema", "sekondi", "winneba", "saltpond", "obuasi",
];

const REJECTED_KEYWORDS = ["nigeria", "lagos", "benin", "togo", "ivory coast", "london", "dubai"];

/** Returns a score 0-100 for location relevance */
const locationScore = (guideLocation: string, touristLocation: string): number => {
  if (!guideLocation) return 0;
  const gl = guideLocation.toLowerCase();

  // Hard reject: if it mentions a foreign major city/country without mentioning Ghana
  const isGhana = GHANA_KEYWORDS.some((kw) => gl.includes(kw));
  const isForeign = REJECTED_KEYWORDS.some((kw) => gl.includes(kw));
  if (!isGhana && isForeign) return 0;

  if (!touristLocation || touristLocation.toLowerCase() === "anywhere in ghana") return 50;

  const tl = touristLocation.toLowerCase();
  if (gl.includes(tl) || tl.includes(gl)) return 100;

  const glWords = gl.split(/\W+/);
  const tlWords = tl.split(/\W+/);
  const overlap = glWords.filter((w) => tlWords.includes(w) && w.length > 2).length;
  return overlap > 0 ? 70 : 30; // Ghana but different city
};

/** 
 * Returns a score 0-100 for price relevance.
 * Severe mismatches (e.g. $150 guide for $25 budget) get 0.
 */
const priceScore = (guidePrice: number, preferredRange: string): number => {
  if (!preferredRange || guidePrice === 0) return 50;

  let min = 0, max = Infinity;
  if (preferredRange === "budget") max = 25;
  else if (preferredRange === "mid") { min = 25; max = 75; }
  else if (preferredRange === "premium") { min = 75; max = 150; }
  else if (preferredRange === "luxury") min = 150;

  // Perfect fit
  if (guidePrice >= min && guidePrice <= max) return 100;
  
  // Near match (within 20% margin)
  if (guidePrice >= min * 0.8 && guidePrice <= max * 1.2) return 70;

  // Severe mismatch: if guide is > 2x the budget or significantly below (though over-budget is worse)
  if (guidePrice > max * 2) return 0; 
  if (guidePrice < min * 0.5) return 20;

  return 30; 
};

const buildFallbackReason = (
  guide: { business_name: string; location: string; description: string; price?: number },
  preferences: { location?: string; interests?: string[]; vibe?: string; traveler?: string; priceRange?: string }
): string => {
  const guideLocation = guide.location ?? "Ghana";
  const interests = (preferences.interests ?? []).join(" and ") || "local experiences";
  const vibe = preferences.vibe ?? "authentic";
  const traveler = preferences.traveler ?? "traveler";
  const pRange = preferences.priceRange || "standard";

  const lScore = locationScore(guideLocation, preferences.location ?? "");
  const locationNote =
    lScore === 100
      ? `Perfectly located in ${guideLocation} — right where you're headed.`
      : `Based in ${guideLocation}, offering a wonderful Ghanaian experience.`;

  let priceNote = "";
  if (guide.price) {
    const pScore = priceScore(guide.price, pRange);
    if (pScore >= 70) {
      priceNote = `At $${guide.price}/day, they fit your ${pRange} budget perfectly.`;
    } else if (guide.price > 0) {
      priceNote = `Note: Their typical rate is $${guide.price}/day, which is above your preferred range.`;
    }
  }

  return `${guide.business_name} is well-suited for ${traveler}s who love ${interests} and prefer a ${vibe} pace. ${locationNote} ${priceNote}`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const groqKey = Deno.env.get("GROQ_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { preferences } = await req.json();
    const touristLocation = preferences.location ?? "";
    const preferredPriceRange = preferences.priceRange ?? "";

    const { data: storefronts, error: fetchError } = await supabase
      .from("storefronts")
      .select("id, business_name, description, location, is_live, user_id")
      .eq("is_live", true);

    if (fetchError) throw fetchError;

    const userIds = storefronts?.map((s: any) => s.user_id).filter(Boolean) || [];
    const phoneMap: Record<string, string> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase.from("profiles").select("user_id, phone").in("user_id", userIds);
      profiles?.forEach((p: any) => { if (p.phone) phoneMap[p.user_id] = p.phone; });
    }

    const processed = (storefronts || []).map((s: any) => {
      let cleanBio = s.description ?? "";
      let mainPhoto = "";
      let guidePrice = 0;
      try {
        const parsed = JSON.parse(s.description);
        cleanBio = parsed.text || parsed.bio || s.description;
        mainPhoto = parsed.mainPhoto || "";
        guidePrice = parseFloat(parsed.price_suggestion || parsed.price || "0");
      } catch (_) { /* ignore */ }

      const lScore = locationScore(s.location ?? "", touristLocation);
      const pScore = priceScore(guidePrice, preferredPriceRange);

      return {
        id: s.id,
        business_name: s.business_name,
        slug: slugify(s.business_name),
        phone: phoneMap[s.user_id] || "",
        image: mainPhoto,
        description: cleanBio,
        location: s.location ?? "",
        price: guidePrice,
        _locationScore: lScore,
        _priceScore: pScore,
        _totalScore: (lScore * 0.6) + (pScore * 0.4) // Balanced weight
      };
    });

    const eligible = processed.filter((g: any) => g._locationScore > 0 && g._totalScore >= 50);
    eligible.sort((a: any, b: any) => b._totalScore - a._totalScore);

    if (eligible.length === 0) {
      return new Response(JSON.stringify({ matches: [], reason: "no_matches_found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are the Akwantuo Matchmaker. 
RULES:
1. Only match guides that FIT the tourist's budget and location.
2. If a guide is $150 and the tourist wants "budget" (<$25), REJECT that guide.
3. matchReason must be honest. Don't say "great value for your budget" if they are expensive.
4. If no good matches exist, return empty array.

Tourist:
- Destination: ${touristLocation}
- Budget: ${preferredPriceRange}
- Interests: ${(preferences.interests ?? []).join(", ")}
- Vibe: ${preferences.vibe}

Return JSON with "matches" array. Each match needs: id, name, slug, phone, location, image, bio, matchScore, matchReason.`;

    const userPrompt = `Possible Guides:\n${JSON.stringify(eligible.slice(0, 10).map(({ _locationScore, _priceScore, _totalScore, ...rest }: any) => rest))}`;

    let matches = [];
    if (groqKey) {
      try {
        const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${groqKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
            temperature: 0.1,
            response_format: { type: "json_object" }
          })
        });
        const d = await r.json();
        const output = JSON.parse(d.choices[0].message.content);
        matches = (output.matches || []).filter((m: any) => (m.matchScore ?? 0) >= 60);
      } catch (e) { console.error(e); }
    }

    if (matches.length === 0) {
      matches = eligible.slice(0, 3).map((s: any) => ({
        id: s.id,
        name: s.business_name,
        slug: s.slug,
        phone: s.phone,
        location: s.location,
        image: s.image,
        bio: s.description,
        matchScore: Math.round(s._totalScore),
        matchReason: buildFallbackReason(s, preferences),
      })).filter((m: any) => m.matchScore >= 60);
    }

    return new Response(JSON.stringify({ matches }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
