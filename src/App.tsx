import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import About from "./pages/About";
import Timeline from "./pages/Timeline";
import News from "./pages/News";
import Documents from "./pages/Documents";
import Stakeholders from "./pages/Stakeholders";
import Team from "./pages/Team";
import Youth from "./pages/programmes/Youth";
import Trade from "./pages/programmes/Trade";
import Women from "./pages/programmes/Women";
import Civic from "./pages/programmes/Civic";
import Culture from "./pages/programmes/Culture";
import Parliament from "./pages/programmes/Parliament";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/news" element={<News />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/stakeholders" element={<Stakeholders />} />
          <Route path="/team" element={<Team />} />
          <Route path="/programmes/youth" element={<Youth />} />
          <Route path="/programmes/trade" element={<Trade />} />
          <Route path="/programmes/women" element={<Women />} />
          <Route path="/programmes/civic" element={<Civic />} />
          <Route path="/programmes/culture" element={<Culture />} />
          <Route path="/programmes/parliament" element={<Parliament />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
