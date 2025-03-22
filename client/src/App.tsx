import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import VoiceCloning from "@/pages/voice-cloning";
import tts from "./pages/tts";
import MainLayout from "@/layouts/main-layout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/Text-to-Speech" component={tts} />
      <Route path="/voice-cloning" component={VoiceCloning} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <>
      <MainLayout>
        <Router />
      </MainLayout>
      <Toaster />
    </>
  );
}

export default App;
