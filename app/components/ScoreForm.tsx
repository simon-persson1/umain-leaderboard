'use client';

import { useState } from 'react';
import { AddScoreRequest } from '@/app/types/leaderboard';

interface ScoreFormProps {
  onScoreAdded?: () => void;
}

export default function ScoreForm({ onScoreAdded }: ScoreFormProps) {
  const [formData, setFormData] = useState<AddScoreRequest>({
    name: '',
    score: 0
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [errors, setErrors] = useState<{ name?: string; score?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { name?: string; score?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.score < 0) {
      newErrors.score = 'Score must be a non-negative number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ text: data.message, type: 'success' });
        setFormData({ name: '', score: 0 });
        setErrors({});
        
        // Notify parent component that a score was added
        if (onScoreAdded) {
          onScoreAdded();
        }
      } else {
        setMessage({ text: data.message, type: 'error' });
      }
    } catch (error) {
      setMessage({ 
        text: 'Failed to add score. Please try again.', 
        type: 'error' 
      });
      console.error('Error adding score:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'score' ? parseInt(value) || 0 : value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter your name"
            disabled={loading}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-2">
            Score
          </label>
          <input
            type="number"
            id="score"
            name="score"
            value={formData.score}
            onChange={handleInputChange}
            min="0"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black ${
              errors.score ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter your score"
            disabled={loading}
          />
          {errors.score && (
            <p className="mt-1 text-sm text-red-600">{errors.score}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          } transition-colors`}
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Adding Score...
            </div>
          ) : (
            'Add Score'
          )}
        </button>
      </form>

      {message && (
        <div className={`mt-4 p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
