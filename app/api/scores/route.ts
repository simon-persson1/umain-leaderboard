import { NextRequest, NextResponse } from 'next/server';
import { Score, LeaderboardResponse, AddScoreRequest, AddScoreResponse } from '@/app/types/leaderboard';
import { prisma } from '@/app/utils/prisma';

// Helper function to get scores from database
async function getScores(): Promise<Score[]> {
  try {
    const scores = await prisma.score.findMany({
      orderBy: {
        score: 'desc'
      }
    });
    
    // Transform Prisma result to match our Score interface
    return scores.map(score => ({
      id: score.id,
      name: score.name,
      score: score.score,
      createdAt: score.createdAt
    }));
  } catch (error: any) {
    console.error('Error fetching scores from database:', error);
    throw error;
  }
}

// Helper function to add score to database
async function addScore(name: string, score: number): Promise<Score> {
  try {
    const newScore = await prisma.score.create({
      data: {
        name,
        score
      }
    });
    
    return {
      id: newScore.id,
      name: newScore.name,
      score: newScore.score,
      createdAt: newScore.createdAt
    };
  } catch (error: any) {
    console.error('Error adding score to database:', error);
    throw error;
  }
}

// Helper function to clear all scores from database
async function clearAllScores(): Promise<void> {
  try {
    await prisma.score.deleteMany();
  } catch (error: any) {
    console.error('Error clearing scores from database:', error);
    throw error;
  }
}

// Helper function to update a score in database
async function updateScore(id: string, name: string, score: number): Promise<Score | null> {
  try {
    const updatedScore = await prisma.score.update({
      where: { id },
      data: {
        name,
        score,
        createdAt: new Date() // Update timestamp on edit
      }
    });
    
    return {
      id: updatedScore.id,
      name: updatedScore.name,
      score: updatedScore.score,
      createdAt: updatedScore.createdAt
    };
  } catch (error: any) {
    console.error('Error updating score in database:', error);
    // If the record doesn't exist, Prisma will throw an error
    if (error.code === 'P2025') {
      return null; // Record not found
    }
    throw error;
  }
}

// Helper function to delete a specific score from database
async function deleteScore(id: string): Promise<boolean> {
  try {
    await prisma.score.delete({
      where: { id }
    });
    return true;
  } catch (error: any) {
    console.error('Error deleting score from database:', error);
    // If the record doesn't exist, Prisma will throw an error
    if (error.code === 'P2025') {
      return false; // Record not found
    }
    throw error;
  }
}

// GET /api/scores - Retrieve all scores
export async function GET(): Promise<NextResponse<LeaderboardResponse>> {
  try {
    const scores = await getScores();

    return NextResponse.json({
      scores,
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
