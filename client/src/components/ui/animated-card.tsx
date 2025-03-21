import { ReactNode, useRef, useState } from "react";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedCard({ children, className = "" }: AnimatedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(1000px) rotateY(0) rotateX(0) translateZ(0)");

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const xPercent = (x / rect.width - 0.5) * 10;
    const yPercent = (y / rect.height - 0.5) * 10;
    
    setTransform(`perspective(1000px) rotateY(${xPercent}deg) rotateX(${-yPercent}deg) translateZ(10px)`);
  };

  const handleMouseLeave = () => {
    setTransform("perspective(1000px) rotateY(0) rotateX(0) translateZ(0)");
  };

  return (
    <div
      ref={cardRef}
      className={`card-3d bg-dark-surface rounded-xl p-5 border border-dark-lighter transition-transform ${className}`}
      style={{ transform, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}
