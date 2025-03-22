import { Link } from "wouter";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-orbitron font-bold mb-6 text-center">
        <span className="gradient-text">KodeX103</span> TTS Engine
      </h1>
      
      <p className="text-center text-gray-400 mb-10 max-w-2xl mx-auto">
        Advanced Text-to-Speech Generation & Voice Cloning application
      </p>
      
      <div className="grid md:grid-cols-2 gap-8 mt-12">
        {/* Text to Speech Section */}
        <AnimatedCard className="h-full flex flex-col">
          <h2 className="text-2xl font-orbitron font-bold mb-4 gradient-text">Text to Speech</h2>
          <p className="text-gray-400 mb-6 flex-grow">
            Convert any text to natural-sounding speech using our advanced TTS model. Choose from multiple voices and languages.
          </p>
          <div className="mt-auto">
            <Link href="/Text-to-Speech">
              <Button className="w-full bg-gradient-to-r from-primary to-[#00D1FF] hover:opacity-90 animate-glow" size="lg">
                Try Now
              </Button>
            </Link>
          </div>
        </AnimatedCard>
        
        {/* Voice Cloning Section */}
        <AnimatedCard className="h-full flex flex-col">
          <h2 className="text-2xl font-orbitron font-bold mb-4 gradient-text">Voice Cloning</h2>
          <p className="text-gray-400 mb-6 flex-grow">
            Clone any voice with just a short audio sample. Our technology learns the voice characteristics and generates speech in the same voice.
          </p>
          <div className="mt-auto">
            <Link href="/voice-cloning">
              <Button className="w-full bg-gradient-to-r from-primary to-[#00D1FF] hover:opacity-90 animate-glow" size="lg">
                Try Now
              </Button>
            </Link>
          </div>
        </AnimatedCard>
      </div>
      
      <div className="glass-effect rounded-2xl p-6 md:p-8 glow-border mt-16">
        <h2 className="text-2xl font-orbitron font-bold mb-4">About Our Application</h2>
        <p className="text-gray-300 mb-4">
          Our Application have two features. You can Generate audio using text or you can clone any voice and generate audio in same voice on given text.
        </p>
        <div className="bg-dark-surface rounded-lg p-4 font-mono text-sm overflow-x-auto">
          <code className="text-gray-300">
          </code>
        </div>
      </div>
    </div>
  );
}
