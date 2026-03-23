import { supabase } from "@/integrations/supabase/client";

export interface AIAnalysisResult {
  bio: string;
  location_suggestion?: string;
  tour: {
    title: string;
    description: string;
    highlights: string[];
    price_suggestion?: string;
  };
  seo_keywords: string[];
}

/**
 * Initiates the AI analysis of uploaded photos and guide context.
 */
export const startAIAnalysis = async (
  guideName: string,
  location: string,
  mainPhoto: string,
  gallery: string[]
): Promise<AIAnalysisResult | null> => {
  try {
    const { data, error } = await supabase.functions.invoke("analyze-guide-assets", {
      body: {
        name: guideName,
        location: location,
        mainPhoto,
        gallery,
      },
    });

    if (error) {
      console.error("Supabase Function Error Details:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
        details: error
      });
      throw error;
    }
    
    return data as AIAnalysisResult;
  } catch (error: any) {
    console.group("AI Analysis Failure Debug");
    console.error("Error calling AI analysis function:", error);
    
    // Attempt to extract the real error JSON if it's a Fetch error with context
    const resp = error.context || error;
    if (resp instanceof Response) {
      try {
        resp.clone().json().then(jsonErr => {
          console.error("AI Backend Error Message:", jsonErr);
        });
      } catch (e) {
        console.error("Could not parse error JSON from response");
      }
    }
    
    console.groupEnd();
    return null;
  }
};
