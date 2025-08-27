// Custom event system for score updates
class ScoreEventBus {
  private listeners: Map<string, Set<() => void>> = new Map();

  // Subscribe to score change events
  subscribe(eventType: string, callback: () => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    
    this.listeners.get(eventType)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.get(eventType)?.delete(callback);
    };
  }

  // Emit score change events
  emit(eventType: string): void {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => callback());
    }
  }

  // Clear all listeners
  clear(): void {
    this.listeners.clear();
  }
}

// Create a singleton instance
export const scoreEventBus = new ScoreEventBus();

// Event types
export const SCORE_EVENTS = {
  SCORES_CHANGED: 'scoresChanged',
  SCORE_ADDED: 'scoreAdded',
  SCORE_UPDATED: 'scoreUpdated',
  SCORE_DELETED: 'scoreDeleted',
  SCORES_CLEARED: 'scoresCleared'
} as const;

// Helper functions for common operations
export const notifyScoreChange = (eventType: string = SCORE_EVENTS.SCORES_CHANGED) => {
  scoreEventBus.emit(eventType);
};

export const subscribeToScoreChanges = (callback: () => void, eventType: string = SCORE_EVENTS.SCORES_CHANGED) => {
  return scoreEventBus.subscribe(eventType, callback);
};
