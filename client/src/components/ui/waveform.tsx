import { useEffect, useRef } from "react";

interface WaveformProps {
  audioUrl?: string;
  isPlaying?: boolean;
  className?: string;
}

export function Waveform({ audioUrl, isPlaying = false, className = "" }: WaveformProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // This is a placeholder animation effect for the waveform
    // In a real implementation, we would use a library like wavesurfer.js to render actual audio waveforms
    if (!waveformRef.current) return;
    
    const waveform = waveformRef.current;
    
    if (isPlaying) {
      waveform.classList.add("animate-pulse");
    } else {
      waveform.classList.remove("animate-pulse");
    }
    
    return () => {
      waveform.classList.remove("animate-pulse");
    };
  }, [isPlaying]);

  return (
    <div 
      ref={waveformRef}
      className={`waveform w-full h-16 relative overflow-hidden rounded-lg bg-dark-surface ${className}`}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {!audioUrl && (
          <p className="text-gray-400 text-sm">No audio loaded</p>
        )}
      </div>
      <div 
        className="absolute inset-0"
        style={{
          background: audioUrl ? "linear-gradient(90deg, #6C63FF 0%, #00D1FF 100%)" : "transparent",
          maskImage: "repeating-linear-gradient(90deg, #000 0px, #000 2px, transparent 2px, transparent 4px)",
          WebkitMaskImage: "repeating-linear-gradient(90deg, #000 0px, #000 2px, transparent 2px, transparent 4px)",
          maskSize: "100% 100%",
          WebkitMaskSize: "100% 100%",
          opacity: audioUrl ? 0.7 : 0,
          animation: isPlaying ? "wave 10s infinite linear" : "none"
        }}
      />
    </div>
  );
}
