// Hackathon Mode: No database, no session tracking
import { v4 as uuidv4 } from 'uuid'

export interface AnalysisSession {
  id: string
  userId: string
  marketUrl: string
  marketQuestion?: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  startedAt: Date
  completedAt?: Date
  analysisSteps?: any
  markdownReport?: string
  forecastCard?: any
  currentStep?: string
  progressEvents?: any[]
  durationSeconds?: number
  p0?: number
  pNeutral?: number
  pAware?: number
  drivers?: any
}

export async function createAnalysisSession(
  userId: string,
  marketUrl: string
): Promise<AnalysisSession> {
  // Hackathon mode: Return in-memory session
  const sessionId = uuidv4()
  
  const session: AnalysisSession = {
    id: sessionId,
    userId,
    marketUrl,
    status: 'pending',
    startedAt: new Date(),
  }

  console.log('[Hackathon] Created in-memory session:', sessionId);
  return session
}

export async function updateAnalysisSession(
  sessionId: string,
  updates: Partial<AnalysisSession>
) {
  // Hackathon mode: No-op
  console.log('[Hackathon] Session update (no-op):', sessionId, updates.status);
}

export async function completeAnalysisSession(
  sessionId: string,
  markdownReport: string,
  analysisSteps: any,
  forecastCard?: any
) {
  // Hackathon mode: No-op
  console.log('[Hackathon] Session completed (no-op):', sessionId);
}

export async function failAnalysisSession(
  sessionId: string,
  error: string
) {
  // Hackathon mode: No-op
  console.log('[Hackathon] Session failed (no-op):', sessionId, error);
}

export async function getAnalysisHistory(userId: string) {
  // Hackathon mode: Return empty array
  return [];
}

export async function getAnalysisById(analysisId: string, userId: string) {
  // Hackathon mode: Return null
  return null;
}
