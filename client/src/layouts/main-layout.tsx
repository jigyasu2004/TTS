import { Link, useLocation } from "wouter";
import { ReactNode } from "react";
import { ThreeBackground } from "@/lib/three-background";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Background Effects */}
      <ThreeBackground />
      
      {/* Header */}
      <header className="py-4 px-6 md:px-10 flex justify-between items-center border-b border-dark-lighter relative z-10">
        <div className="flex items-center">
          <Link href="/">
            <a className="text-3xl font-orbitron font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#6C63FF] to-[#00D1FF] animate-pulse-slow">
              KodeX<span className="text-white">103</span>
            </a>
          </Link>
        </div>
        <nav>
          <ul className="flex space-x-1 md:space-x-4">
            <li className={`px-3 py-2 rounded-lg transition-all hover:bg-dark-accent ${location === '/Text-to-Speech' ? 'tab-active' : ''}`}>
              <Link href="/Text-to-Speech">
                <a className="font-medium text-sm md:text-base">Text to Speech</a>
              </Link>
            </li>
            <li className={`px-3 py-2 rounded-lg transition-all hover:bg-dark-accent ${location === '/voice-cloning' ? 'tab-active' : ''}`}>
              <Link href="/voice-cloning">
                <a className="font-medium text-sm md:text-base">Voice Cloning</a>
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-8 py-8 flex-1 relative z-10">
        {children}
      </main>
    </div>
  );
}
