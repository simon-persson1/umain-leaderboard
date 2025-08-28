'use client';

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
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
  const contextRef = useRef<gsap.Context | null>(null);

  // Create GSAP context
  useLayoutEffect(() => {
    // Create context
    contextRef.current = gsap.context((self) => {
      // Initial setup if needed
    }, containerRef);

    // Cleanup
    return () => {
      if (contextRef.current) {
        contextRef.current.revert(); // This will also kill any animations
      }
    };
  }, []); // Empty dependency array means this only runs once on mount

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

  const triggerConfetti = (element: Element, movedToTopThree: boolean) => {
    // Find the score text element within the container
    const scoreElement = element.querySelector('.score-value');
    const rect = (scoreElement || element).getBoundingClientRect();
    
    // Calculate position from the center of the score text
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    
    // More dramatic celebration for moving into top 3
    if (movedToTopThree) {
      // First burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x, y },
        colors: ['#FFD700', '#FFA500', '#FF4500'], // Gold, orange, red
        ticks: 200,
        startVelocity: 30,
        shapes: ['circle', 'square'],
        scalar: 0.75
      });
      
      // Second burst after a small delay
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { x, y },
          colors: ['#FFD700', '#FFA500', '#FF4500'],
          ticks: 150,
          startVelocity: 25,
          shapes: ['circle', 'square'],
          scalar: 0.5
        });
      }, 200);
    } else {
      // Simple celebration for regular position improvement
      confetti({
        particleCount: 30,
        spread: 40,
        origin: { x, y },
        colors: ['#00FF00', '#4CAF50', '#2196F3'], // Green and blue tones
        ticks: 100,
        startVelocity: 15,
        shapes: ['circle'],
        scalar: 0.4
      });
    }
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
      // Only count as improved if:
      // 1. We have a last position
      // 2. The score moved up in rank
      // 3. The score is not 0 (we don't celebrate groups with no score)
      const hasImproved = lastPosition !== undefined && 
                         newIndex < lastPosition && 
                         score.score !== 0;
      
      // Track if it moved into top 3
      const wasInTopThree = lastPosition !== undefined && lastPosition < 3;
      const isNowInTopThree = newIndex < 3;
      const movedIntoTopThree = !wasInTopThree && isNowInTopThree;
      
      return { score, hasImproved, movedIntoTopThree };
    }).filter(x => x.hasImproved);

    // Store new positions for next comparison
    newScores.forEach((score, index) => {
      lastPositions.current.set(score.id, index);
    });

    const triggerConfettiForImproved = () => {
      improvedScores.forEach(({ score, movedIntoTopThree }) => {
        const element = document.querySelector(`[data-flip-id="score-${score.id}"]`);
        if (element) {
          // More confetti for moving into top 3, less for regular position improvements
          triggerConfetti(element, movedIntoTopThree);
        }
      });
    };

    // Wait for React to update
    requestAnimationFrame(() => {
      if (!contextRef.current) return;

      // Create a new timeline for this animation
      const tl = gsap.timeline();

      if (isMovingBetweenSections) {
        // If teams are crossing sections, just update without animation
        // But still call Flip.from with 0 duration to ensure proper cleanup
        tl.add(
          Flip.from(state, {
            duration: 0,
            ease: "none",
            absolute: true,
            simple: true,
            onComplete: triggerConfettiForImproved
          })
        );
      } else {
        // Normal FLIP animation for other cases
        tl.add(
          Flip.from(state, {
            duration: 0.8,
            ease: "power2.inOut",
            absolute: true,
            onComplete: triggerConfettiForImproved
          })
        );
      }

      // Add the timeline to the context
      contextRef.current.add(() => tl);
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
      <div className="text-center flex flex-col justify-center items-center h-screen">
        <div className="text-white text-[200px]">
          KTH x UMAIN
        </div>
       
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col justify-center items-center">
   


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
