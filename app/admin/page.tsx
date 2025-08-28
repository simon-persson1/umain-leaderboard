'use client';

import { useState } from 'react';
import ScoreForm from '../components/ScoreForm';
import ScoreManager from '../components/ScoreManager';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'add' | 'manage'>('add');
  const [refreshKey, setRefreshKey] = useState(0);
  const [eventCount, setEventCount] = useState(0);

  // Function to trigger a refresh of the leaderboard
  const handleScoresChanged = () => {
    setRefreshKey(prev => prev + 1);
    setEventCount(prev => prev + 1);
    
    // Dispatch custom event for current tab
    console.log('Admin: Dispatching scoresChanged event for current tab');
    window.dispatchEvent(new CustomEvent('scoresChanged'));
    
    // Update localStorage for other tabs
    console.log('Admin: Updating localStorage for other tabs');
    localStorage.setItem('leaderboardUpdate', Date.now().toString());
  };

  // Test function
  const testEvent = () => {
    console.log('Admin: Testing event dispatch...');
    // Test both methods
    window.dispatchEvent(new CustomEvent('scoresChanged'));
    localStorage.setItem('leaderboardUpdate', Date.now().toString());
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎯 Admin Panel
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Manage your leaderboard scores
          </p>
          
         
        </div>

        {/* Tab Navigation */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex justify-center">
            <div className="bg-white rounded-lg p-1 shadow-lg">
              <button
                onClick={() => setActiveTab('add')}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  activeTab === 'add'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                ➕ Add New Score
              </button>
              <button
                onClick={() => setActiveTab('manage')}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  activeTab === 'manage'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                📊 Manage Scores
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-4xl mx-auto">
          {activeTab === 'add' ? (
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Add New Score
                </h2>
                <p className="text-gray-600">
                  Enter the player's name and score to add them to the leaderboard
                </p>
              </div>
              
              <ScoreForm onScoreAdded={handleScoresChanged} />
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Manage Existing Scores
                </h2>
                <p className="text-gray-600">
                  View, edit, and delete scores from the leaderboard
                </p>
              </div>
              
              <ScoreManager onScoresChanged={handleScoresChanged} />
            </div>
          )}
        </div>

      
      </div>
    </main>
  );
}
