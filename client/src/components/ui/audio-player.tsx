import { useState, useRef, useEffect } from "react";
import { Waveform } from "./waveform";

interface AudioPlayerProps {
  audioUrl?: string;
  allowDownload?: boolean;
  onBack?: () => void;
}

export function AudioPlayer({ audioUrl, allowDownload = true, onBack }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioUrl) return;
    
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });
    
    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
    });
    
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
    });
    
    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = 'generated-audio.wav';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full">
      <Waveform audioUrl={audioUrl} isPlaying={isPlaying} />
      
      <div className="flex justify-between items-center mt-4">
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={togglePlayPause}
            className="bg-primary hover:bg-blue-700 rounded-full w-12 h-12 flex items-center justify-center transition-colors"
            disabled={!audioUrl}
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">{formatTime(currentTime)}</span>
            <div className="w-48 md:w-96 h-1 bg-dark-lighter rounded-full">
              <div 
                className="h-1 bg-gradient-to-r from-primary to-secondary rounded-full" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm text-gray-400">{formatTime(duration)}</span>
          </div>
        </div>
        
        {allowDownload && audioUrl && (
          <button 
            type="button" 
            onClick={handleDownload}
            className="flex items-center space-x-2 bg-dark-lighter hover:bg-dark-accent px-4 py-2 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download</span>
          </button>
        )}
      </div>
      
      {onBack && (
        <div className="mt-6">
          <button 
            type="button" 
            onClick={onBack}
            className="flex items-center space-x-2 bg-dark-lighter hover:bg-dark-accent px-4 py-2 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Generate Another</span>
          </button>
        </div>
      )}
    </div>
  );
}
