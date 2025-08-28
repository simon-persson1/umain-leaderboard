'use client';

import { useState, useEffect } from 'react';
import { Score } from '@/app/types/leaderboard';

interface ScoreManagerProps {
  onScoresChanged?: () => void;
}

export default function ScoreManager({ onScoresChanged }: ScoreManagerProps) {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editScore, setEditScore] = useState(0);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchScores();
  }, []);

  const fetchScores = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/scores');
      const data = await response.json();
      
      if (data.success) {
        setScores(data.scores);
      }
    } catch (error) {
      console.error('Error fetching scores:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = async (score: Score) => {
    try {
      // Fetch latest scores before starting edit
      const response = await fetch('/api/scores');
      const data = await response.json();
      
      if (data.success) {
        // Find the latest version of this score
        const latestScore = data.scores.find((s: Score) => s.id === score.id);
        if (latestScore) {
          setEditingId(latestScore.id);
          setEditName(latestScore.name);
          setEditScore(latestScore.score);
        } else {
          // Score was deleted
          setMessage({ text: 'This score no longer exists', type: 'error' });
          fetchScores(); // Refresh the list
        }
      } else {
        setMessage({ text: 'Failed to get latest score data', type: 'error' });
      }
    } catch (error) {
      console.error('Error fetching latest score:', error);
      setMessage({ text: 'Failed to start editing - please try again', type: 'error' });
    }
  };

  const saveEdit = async () => {
    if (!editingId) return;

    try {
      const response = await fetch('/api/scores', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, name: editName, score: editScore }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ text: 'Score updated successfully!', type: 'success' });
        setEditingId(null);
        fetchScores();
        
        // Notify parent component that scores changed
        if (onScoresChanged) {
          onScoresChanged();
        }
      } else {
        setMessage({ text: data.message, type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Failed to update score', type: 'error' });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditScore(0);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this score? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/scores?id=${id}`, { method: 'DELETE' });
      const data = await response.json();

      if (data.success) {
        setMessage({ text: 'Score deleted successfully!', type: 'success' });
        fetchScores();
        
        // Notify parent component that scores changed
        if (onScoresChanged) {
          onScoresChanged();
        }
      } else {
        setMessage({ text: data.message, type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Failed to delete score', type: 'error' });
    }
  };

  const clearAll = async () => {
    if (!confirm('Are you sure you want to clear all scores? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/scores', { method: 'DELETE' });
      const data = await response.json();

      if (data.success) {
        setMessage({ text: 'All scores cleared!', type: 'success' });
        fetchScores();
        
        // Notify parent component that scores changed
        if (onScoresChanged) {
          onScoresChanged();
        }
      } else {
        setMessage({ text: data.message, type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Failed to clear scores', type: 'error' });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg text-black font-semibold">Manage Scores</h3>
        <button
          onClick={clearAll}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
        >
          🗑️ Clear All
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {scores.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No scores to display</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full  rounded shadow">
            <thead >
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {scores.map((score, index) => (
                <tr key={score.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      {index === 0 && <span className="text-yellow-500 text-xl mr-2"></span>}
                      {index === 1 && <span className="text-gray-400 text-xl mr-2"></span>}
                      {index === 2 && <span className="text-amber-600 text-xl mr-2"></span>}
                      <span className="font-medium text-black">#{index + 1}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4  text-black">
                    {editingId === score.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 text-black"
                      />
                    ) : (
                      <span className="font-medium">{score.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {editingId === score.id ? (
                      <input
                        type="number"
                        value={editScore}
                        onChange={(e) => setEditScore(parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 text-black"
                        min="0"
                      />
                    ) : (
                      <span className="text-sm font-bold text-blue-600">{score.score}</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {editingId === score.id ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={saveEdit}
                          className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                        >
                          💾 Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
                        >
                          ❌ Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={async () => await startEdit(score)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(score.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
