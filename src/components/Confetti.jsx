import { useEffect, useState } from 'react';

const COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#60a5fa', '#22d3ee'];

const Confetti = ({ duration = 3000 }) => {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    const confettiPieces = [];
    const count = 80;

    for (let i = 0; i < count; i++) {
      confettiPieces.push({
        id: i,
        left: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 0.8,
        duration: Math.random() * 1.5 + 1.5,
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        shape: Math.random() > 0.5 ? 'circle' : 'rect',
      });
    }

    setPieces(confettiPieces);

    const timer = setTimeout(() => {
      setPieces([]);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (pieces.length === 0) return null;

  return (
    <div className="confetti-container">
      {pieces.map(piece => (
        <div
          key={piece.id}
          className="confetti-piece"
          style={{
            left: `${piece.left}%`,
            backgroundColor: piece.color,
            width: piece.shape === 'circle' ? piece.size : piece.size * 0.6,
            height: piece.size,
            borderRadius: piece.shape === 'circle' ? '50%' : '2px',
            animationDuration: `${piece.duration}s`,
            animationDelay: `${piece.delay}s`,
            transform: `rotate(${piece.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
};

export default Confetti;
