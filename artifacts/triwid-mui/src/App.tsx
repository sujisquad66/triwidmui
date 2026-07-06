import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AppProvider, useAppStore } from "@/lib/store";
import { Shell } from "@/components/layout/Shell";
import { Intro } from "@/pages/Intro";
import { Home } from "@/pages/Home";
import { Watch } from "@/pages/Watch";
import { Read } from "@/pages/Read";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function RouteWrapper() {
  const { hasSeenIntro } = useAppStore();
  const [location, setLocation] = useLocation();

  // Redirect to intro if not seen
  if (!hasSeenIntro && location !== '/') {
    setLocation('/');
    return null;
  }

  return (
    <Shell>
      <Switch>
        <Route path="/" component={hasSeenIntro ? Home : Intro} />
        <Route path="/home" component={Home} />
        <Route path="/watch" component={Watch} />
        <Route path="/read" component={Read} />
        <Route component={NotFound} />
      </Switch>
    </Shell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
            <RouteWrapper />
          </WouterRouter>
        </AppProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
