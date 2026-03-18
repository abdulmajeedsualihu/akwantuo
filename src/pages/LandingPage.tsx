import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import LandingPageTemplate from "@/components/LandingPageTemplate";
import { LandingPageRecord, loadLandingRecord } from "@/lib/onboardingService";
import { Button } from "@/components/ui/button";

const LandingPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [state, setState] = useState<{
    loading: boolean;
    record: LandingPageRecord | null;
    error: string | null;
  }>({ loading: true, record: null, error: null });

  useEffect(() => {
    if (!slug) return;
    setState({ loading: true, record: null, error: null });
    loadLandingRecord(slug)
      .then((record) => {
        if (!record) {
          setState({ loading: false, record: null, error: "We could not find that page." });
          return;
        }
        setState({ loading: false, record, error: null });
      })
      .catch((error) => {
        console.error(error);
        setState({ loading: false, record: null, error: error?.message || "Unable to load landing page." });
      });
  }, [slug]);

  if (state.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-lg font-semibold tracking-widest uppercase text-white/40">Loading experience...</p>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white gap-4 px-4 text-center">
        <p className="text-xl font-bold">{state.error}</p>
        <p className="text-sm text-slate-300 max-w-sm">Try creating a tour site first or check the address again.</p>
        <Link to="/">
          <Button className="bg-primary-navy hover:bg-primary-navy/90 h-14 px-8 rounded-xl font-bold">Back to Akwantuo</Button>
        </Link>
      </div>
    );
  }

  if (!state.record) {
    return null;
  }

  return <LandingPageTemplate record={state.record} />;
};

export default LandingPage;
