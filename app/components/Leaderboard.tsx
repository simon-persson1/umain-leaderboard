'use client';

import { useState, useEffect } from 'react';
import { Score } from '@/app/types/leaderboard';

interface LeaderboardProps {
  refreshKey?: number;
}

export default function Leaderboard({ refreshKey = 0 }: LeaderboardProps) {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchScores();
    
    // Auto-refresh every 3 seconds
    const interval = setInterval(() => {
      fetchScores(false); // Don't show loading spinner on auto-refresh
    }, 3000);
    
    // Cleanup interval on component unmount
    return () => {
      clearInterval(interval);
    };
  }, [refreshKey]); // Re-fetch when refreshKey changes

  const fetchScores = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      
      const response = await fetch('/api/scores');
      const data = await response.json();
      
      if (data.success) {
        setScores(data.scores);
      } else {
        setError('Failed to fetch scores');
      }
    } catch (err) {
      setError('Failed to fetch scores');
      console.error('Error fetching scores:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
          The leaderboard is empty. Be the first to add a score!
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
    <div className="overflow-x-auto flex flex-col justify-center items-center">
   

      <div className="grid grid-cols-12 gap-8 border-t border-white/20 w-full h-[90vh] border-b">

<h1 className="text-white text-4xl font-bold">KTH x UMAIN</h1>

        {/* Top 3 Scores */}
        <div className="col-span-8 flex flex-col">
          {scores.slice(0, 3).map((score, index) => (
            <div className="flex justify-start items-start py-8" key={score.id}>
              <div className="text-[200px] font-bold text-white leading-none">{score.score.toLocaleString()}</div>
              <div className="mt-7">
                <span className="text-[18px] font-bold uppercase text-white/60">{score.name}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Rest of the Scores */}
        <div className="col-span-4 pl-8">
          <div className="flex flex-col gap-6">
            {scores.slice(3).map((score, index) => (
              <div className="flex items-center gap-4" key={score.id}>
                <div className="text-[32px] font-bold text-white leading-none">{score.score.toLocaleString()}</div>
                <div>
                  <span className="text-[14px] font-bold uppercase text-white/60">{score.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
