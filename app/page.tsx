'use client';

import { useState, useEffect } from 'react';
import Leaderboard from './components/Leaderboard';

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [eventCount, setEventCount] = useState(0);

  // Listen for localStorage changes to refresh when scores change
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'leaderboardUpdate') {
        console.log('Leaderboard: Received localStorage change event');
        setEventCount(prev => prev + 1);
        setRefreshKey(prev => prev + 1);
      }
    };

    // Listen for localStorage changes from other tabs
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for changes in the current tab
    const handleLocalChange = () => {
      console.log('Leaderboard: Received localStorage change in current tab');
      setEventCount(prev => prev + 1);
      setRefreshKey(prev => prev + 1);
    };

    // Custom event for current tab
    window.addEventListener('scoresChanged', handleLocalChange);
    
    console.log('Leaderboard: Event listeners attached (storage + scoresChanged)');
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('scoresChanged', handleLocalChange);
      console.log('Leaderboard: Event listeners removed');
    };
  }, []);

  return (
    <main className="min-h-screen ">
      <div className="container mx-auto px-4 py-8">
      

        {/* Leaderboard */}
        <div className=" rounded-2xl p-6 md:p-8">
          <Leaderboard refreshKey={refreshKey} />
        </div>
      </div>
    </main>
  );
}