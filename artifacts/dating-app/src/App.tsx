import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import { ThemeProvider } from '@/components/theme-provider';
import { ProtectedLayout } from '@/components/layout';

import Login from '@/pages/login';
import Home from '@/pages/home';
import Likes from '@/pages/likes';
import Matches from '@/pages/matches';
import Profile from '@/pages/profile';
import Settings from '@/pages/settings';
import Onboarding from '@/pages/onboarding';

const queryClient = new QueryClient();

function ProtectedRoutes() {
  return (
    <ProtectedLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/likes" component={Likes} />
        <Route path="/matches" component={Matches} />
        <Route path="/profile" component={Profile} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </ProtectedLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/onboarding" component={Onboarding} />
      <Route component={ProtectedRoutes} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;