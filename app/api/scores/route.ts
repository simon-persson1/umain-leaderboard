import { NextRequest, NextResponse } from 'next/server';
import { Score, LeaderboardResponse, AddScoreRequest, AddScoreResponse } from '@/app/types/leaderboard';

// Temporary in-memory storage for development (will be replaced by Vercel KV)
let inMemoryScores: Score[] = [];
let scoreCounter = 1;

// Helper function to get scores (tries Vercel KV first, falls back to in-memory)
async function getScores(): Promise<Score[]> {
  try {
    // Try to import and use Vercel KV
    const { kv } = await import('@vercel/kv');
    const scores = await kv.zrange('leaderboard', 0, -1, { withScores: true });
    
    // Transform the data from Redis sorted set format
    const transformedScores: Score[] = scores.map((item: any, index: number) => ({
      id: `score_${Date.now()}_${index}`,
      name: item.member as string,
      score: item.score as number,
      createdAt: new Date()
    }));

    return transformedScores;
  } catch (error: any) {
    console.log('Vercel KV not configured, using in-memory storage:', error.message);
    return inMemoryScores;
  }
}

// Helper function to add score (tries Vercel KV first, falls back to in-memory)
async function addScore(name: string, score: number): Promise<Score> {
  try {
    // Try to import and use Vercel KV
    const { kv } = await import('@vercel/kv');
    await kv.zadd('leaderboard', { score, member: name });
    
    const newScore: Score = {
      id: `score_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      score,
      createdAt: new Date()
    };
    
    return newScore;
  } catch (error: any) {
    console.log('Vercel KV not configured, using in-memory storage:', error.message);
    
    // Fallback to in-memory storage
    const newScore: Score = {
      id: `score_${Date.now()}_${scoreCounter++}`,
      name,
      score,
      createdAt: new Date()
    };
    
    inMemoryScores.push(newScore);
    // Sort by score in descending order
    inMemoryScores.sort((a, b) => b.score - a.score);
    
    return newScore;
  }
}

// Helper function to clear all scores
async function clearAllScores(): Promise<void> {
  try {
    // Try to import and use Vercel KV
    const { kv } = await import('@vercel/kv');
    await kv.del('leaderboard');
  } catch (error: any) {
    console.log('Vercel KV not configured, using in-memory storage:', error.message);
    // Fallback to in-memory storage
    inMemoryScores = [];
  }
}

// Helper function to update a score
async function updateScore(id: string, name: string, score: number): Promise<Score | null> {
  try {
    // Try to import and use Vercel KV
    const { kv } = await import('@vercel/kv');
    // For Redis, we need to remove the old entry and add the new one
    // Since we're using name as member, we'll need to handle this differently
    // For now, we'll use the in-memory approach for editing
    throw new Error('Editing not yet implemented for Vercel KV');
  } catch (error: any) {
    console.log('Vercel KV not configured, using in-memory storage:', error.message);
    
    // Fallback to in-memory storage
    const scoreIndex = inMemoryScores.findIndex(s => s.id === id);
    if (scoreIndex === -1) {
      return null;
    }
    
    const updatedScore: Score = {
      ...inMemoryScores[scoreIndex],
      name,
      score,
      createdAt: new Date()
    };
    
    inMemoryScores[scoreIndex] = updatedScore;
    // Sort by score in descending order
    inMemoryScores.sort((a, b) => b.score - a.score);
    
    return updatedScore;
  }
}

// Helper function to delete a specific score
async function deleteScore(id: string): Promise<boolean> {
  try {
    // Try to import and use Vercel KV
    const { kv } = await import('@vercel/kv');
    // For Redis, we'd need to remove by member name
    // For now, we'll use the in-memory approach
    throw new Error('Deleting not yet implemented for Vercel KV');
  } catch (error: any) {
    console.log('Vercel KV not configured, using in-memory storage:', error.message);
    
    // Fallback to in-memory storage
    const scoreIndex = inMemoryScores.findIndex(s => s.id === id);
    if (scoreIndex === -1) {
      return false;
    }
    
    inMemoryScores.splice(scoreIndex, 1);
    return true;
  }
}

// GET /api/scores - Retrieve all scores
export async function GET(): Promise<NextResponse<LeaderboardResponse>> {
  try {
    const scores = await getScores();
    
    // Sort by score in descending order
    const sortedScores = scores.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      scores: sortedScores,
      success: true
    });
  } catch (error) {
    console.error('Error fetching scores:', error);
    return NextResponse.json({
      scores: [],
      success: false
    }, { status: 500 });
  }
}

// POST /api/scores - Add a new score
export async function POST(request: NextRequest): Promise<NextResponse<AddScoreResponse>> {
  try {
    const body: AddScoreRequest = await request.json();
    
    // Validate input
    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return NextResponse.json({
        success: false,
        message: 'Name is required and must be a non-empty string'
      }, { status: 400 });
    }

    if (typeof body.score !== 'number' || body.score < 0) {
      return NextResponse.json({
        success: false,
        message: 'Score must be a valid non-negative number'
      }, { status: 400 });
    }

    const name = body.name.trim();
    const score = body.score;

    // Add score using helper function
    const newScore = await addScore(name, score);

    return NextResponse.json({
      success: true,
      message: 'Score added successfully!',
      score: newScore
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding score:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to add score. Please try again.'
    }, { status: 500 });
  }
}

// DELETE /api/scores - Clear all scores
export async function DELETE(): Promise<NextResponse<{ success: boolean; message: string }>> {
  try {
    await clearAllScores();
    
    return NextResponse.json({
      success: true,
      message: 'All scores cleared successfully!'
    });
  } catch (error) {
    console.error('Error clearing scores:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to clear scores. Please try again.'
    }, { status: 500 });
  }
}

// PUT /api/scores - Update a specific score
export async function PUT(request: NextRequest): Promise<NextResponse<{ success: boolean; message: string; score?: Score }>> {
  try {
    const body = await request.json();
    const { id, name, score } = body;
    
    // Validate input
    if (!id || !name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({
        success: false,
        message: 'ID and name are required'
      }, { status: 400 });
    }

    if (typeof score !== 'number' || score < 0) {
      return NextResponse.json({
        success: false,
        message: 'Score must be a valid non-negative number'
      }, { status: 400 });
    }

    const updatedScore = await updateScore(id, name.trim(), score);
    
    if (!updatedScore) {
      return NextResponse.json({
        success: false,
        message: 'Score not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Score updated successfully!',
      score: updatedScore
    });
  } catch (error) {
    console.error('Error updating score:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update score. Please try again.'
    }, { status: 500 });
  }
}
