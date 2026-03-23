import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import LandingPage from "./pages/LandingPage.tsx";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <OnboardingProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner
            position="top-right"
            toastOptions={{
              classNames: {
                error: "bg-red-600 text-white border-red-700 [&_[data-description]]:text-red-100 [&_[data-icon]]:text-white",
              },
            }}
          />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/onboarding/role" element={<Index />} />
              <Route path="/onboarding/phone" element={<Index />} />
              <Route path="/onboarding/profile" element={<Index />} />
              <Route path="/onboarding/photos" element={<Index />} />
              <Route path="/onboarding/ai-loading" element={<Index />} />
              <Route path="/onboarding/tour" element={<Index />} />
              <Route path="/onboarding/preview" element={<Index />} />
              <Route path="/onboarding/success" element={<Index />} />
              <Route path="/dashboard" element={<Index />} />
              <Route path="/:slug" element={<LandingPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </OnboardingProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
