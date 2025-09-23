import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TranslationProvider } from "@/hooks/use-translation";
import { registerServiceWorker } from "@/lib/pwa";
import ErrorBoundary from "@/components/ErrorBoundary";
import Header from "@/components/Header";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Register from "@/pages/register";
import Playground from "@/pages/playground";
import Docs from "@/pages/docs";
import Support from "@/pages/support";
import Showcase from "@/pages/showcase";
import SpecializedAI from "@/pages/specialized-ai";
import Pricing from "@/pages/pricing";
import Subscribe from "@/pages/subscribe";
import Training from "@/pages/training";
import Marketplace from "@/pages/marketplace";
import AgentEvaluation from "@/pages/agent-evaluation";
import ApiKeys from "@/pages/apiKeys";
import Treasury from "@/pages/treasury";
import Agents from "@/pages/agents";
import Analytics from "@/pages/analytics";
import Security from "@/pages/security";
import AdminDashboard from "@/pages/admin";
import AISocialPage from "@/pages/ai-social";
import EmergencyDashboard from "@/pages/EmergencyDashboard";
import MobileEmergencyApp from "@/components/mobile/MobileEmergencyApp";
import ConsultationPage from "@/pages/ConsultationPage";
import ParentalControlsPage from "@/pages/parental-controls";
import VoicePage from "@/pages/voice";
import KolossusForge from "@/pages/kolossus-forge";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <>
      <Header />
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/dashboard" component={Dashboard} />
      <Route path="/register" component={Register} />
      <Route path="/playground" component={Playground} />
      <Route path="/docs" component={Docs} />
      <Route path="/support" component={Support} />
      <Route path="/showcase" component={Showcase} />
      <Route path="/specialized" component={SpecializedAI} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/training" component={Training} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/evaluation" component={AgentEvaluation} />
      <Route path="/api-keys" component={ApiKeys} />
      <Route path="/treasury" component={Treasury} />
      <Route path="/agents" component={Agents} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/security" component={Security} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/ai-social" component={AISocialPage} />
      <Route path="/emergency" component={EmergencyDashboard} />
      <Route path="/emergency/mobile" component={MobileEmergencyApp} />
      <Route path="/consultations" component={ConsultationPage} />
      <Route path="/parental-controls" component={ParentalControlsPage} />
      <Route path="/voice" component={VoicePage} />
      <Route path="/kolossus" component={KolossusForge} />
      <Route path="/treasury" component={Treasury} />
      <Route component={NotFound} />
    </Switch>
    </>
  );
}

function App() {
  // Register service worker for PWA functionality
  React.useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TranslationProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </TranslationProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
