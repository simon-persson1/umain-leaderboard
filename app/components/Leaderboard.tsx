'use client';

import { useState, useEffect, useRef } from 'react';
import { Score } from '@/app/types/leaderboard';
import AnimatedScore from './AnimatedScore';
import gsap from 'gsap';
import { Flip } from 'gsap/dist/Flip';
import confetti from 'canvas-confetti';

// Register GSAP plugins only on the client side
if (typeof window !== 'undefined') {
  gsap.registerPlugin(Flip);
}

interface LeaderboardProps {
  refreshKey?: number;
}

export default function Leaderboard({ refreshKey = 0 }: LeaderboardProps) {
  const [scores, setScores] = useState<Score[]>([]);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPositions = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    fetchScores();
    
    // Auto-refresh every 3 seconds
    const interval = setInterval(() => {
      fetchScores();
    }, 3000);
    
    // Cleanup interval on component unmount
    return () => {
      clearInterval(interval);
    };
  }, [refreshKey]); // Re-fetch when refreshKey changes

  const triggerConfetti = (element: Element, isTopThree: boolean) => {
    // Find the score text element within the container
    const scoreElement = element.querySelector('.score-value');
    const rect = (scoreElement || element).getBoundingClientRect();
    
    // Calculate position from the center of the score text
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    
    confetti({
      particleCount: isTopThree ? 100 : 50,
      spread: isTopThree ? 70 : 50,
      origin: { x, y },
      colors: ['#FF0000', '#FF8800', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF'], // Rainbow colors
      ticks: isTopThree ? 200 : 150,
      startVelocity: isTopThree ? 30 : 20,
      shapes: ['circle', 'square'],
      scalar: isTopThree ? 0.75 : 0.5
    });
  };

  const updateScoresWithAnimation = (newScores: Score[]) => {
    // Always get the state first to ensure GSAP tracking is consistent
    const state = Flip.getState("[data-flip-id]");

    // Check if any team is moving between top 3 and rest
    const isMovingBetweenSections = newScores.some((score, newIndex) => {
      const oldIndex = scores.findIndex(s => s.id === score.id);
      // Check if position changed from >3 to <=3 or vice versa
      return (oldIndex >= 3 && newIndex < 3) || (oldIndex < 3 && newIndex >= 3);
    });

    // Update the scores
    setScores(newScores);

    // Find scores that genuinely improved their position
    const improvedScores = newScores.map((score, newIndex) => {
      const lastPosition = lastPositions.current.get(score.id);
      // Only count as improved if we have a last position and it moved up
      const hasImproved = lastPosition !== undefined && newIndex < lastPosition;
      return { score, hasImproved };
    }).filter(x => x.hasImproved);

    // Store new positions for next comparison
    newScores.forEach((score, index) => {
      lastPositions.current.set(score.id, index);
    });

    const triggerConfettiForImproved = () => {
      improvedScores.forEach(({ score }) => {
        const element = document.querySelector(`[data-flip-id="score-${score.id}"]`);
        if (element) {
          const isTopThree = newScores.indexOf(score) < 3;
          triggerConfetti(element, isTopThree);
        }
      });
    };

    // Wait for React to update
    requestAnimationFrame(() => {
      if (isMovingBetweenSections) {
        // If teams are crossing sections, just update without animation
        // But still call Flip.from with 0 duration to ensure proper cleanup
        Flip.from(state, {
          duration: 0,
          ease: "none",
          absolute: true,
          simple: true,
          onComplete: triggerConfettiForImproved
        });
      } else {
        // Normal FLIP animation for other cases
        Flip.from(state, {
          duration: 0.8,
          ease: "power2.inOut",
          absolute: true,
          onComplete: triggerConfettiForImproved
        });
      }
    });
  };

  const fetchScores = async () => {
    try {
      setError(null);
      
      const response = await fetch('/api/scores');
      const data = await response.json();
      
      if (data.success) {
        updateScoresWithAnimation(data.scores);
      } else {
        setError('Failed to fetch scores');
      }
    } catch (err) {
      setError('Failed to fetch scores');
      console.error('Error fetching scores:', err);
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => fetchScores()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (scores.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 text-lg mb-4">
        </div>
        <a
          href="/admin"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Your Score
        </a>
      </div>
    );
  }

  return (
    <div className=" flex flex-col justify-center items-center">
   


      <div className="grid grid-cols-12 gap-8  border-white/20 w-full h-[90vh]">
      <h1 className="text-white/60 text-4xl font-bold w-full col-span-12 pt-8">KTH x UMAIN Leaderboard</h1>

        {/* Top 3 Scores */}
        <div className="col-span-8 flex flex-col">
          {scores.slice(0, 3).map((score, index) => (
            <div className="flex flex-col py-8" key={score.id} data-flip-id={`score-${score.id}`}>
              <span className="text-[24px] font-bold uppercase text-white/60">{score.name}</span>
              <div className="flex items-end">
                <AnimatedScore 
                  value={score.score} 
                  className="score-value text-[clamp(50px,15vw,150px)] uppercase font-bold text-white leading-none"
                  duration={1.5}
                />
                <span className="text-[18px] font-bold uppercase text-white mb-4">pts</span>
              </div>
            </div>
          ))}
        </div>

        {/* Rest of the Scores */}
        <div className="col-span-4">
          <div className="flex flex-col gap-10 pt-8">
            {scores.slice(3).map((score, index) => (
              <div className="flex flex-col" key={score.id} data-flip-id={`score-${score.id}`}>
                <span className="text-[18px] font-bold uppercase text-white/60">{score.name}</span>
                <div className="flex items-end gap-2">
                                      <AnimatedScore 
                      value={score.score}
                      className="score-value text-[32px] font-bold text-white leading-none"
                      duration={1.5}
                    />
                  <span className="text-[12px] font-bold uppercase text-white">pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
