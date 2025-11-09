// Hackathon Mode: No usage tracking or rate limiting

// Store current analysis context
let currentAnalysisContext: {
  userId?: string;
  customerId?: string;
} = {};

export function setAnalysisContext(userId: string, customerId: string) {
  // Hackathon mode: No-op
  currentAnalysisContext = { userId, customerId };
}

export function clearAnalysisContext() {
  // Hackathon mode: No-op
  currentAnalysisContext = {};
}

export function getAnalysisContext() {
  return currentAnalysisContext;
}

export async function trackValyuUsageImmediate(
  cost: number,
  query: string,
  searchType: string
) {
  // Hackathon mode: No-op
  console.log('[Hackathon] Valyu usage:', { cost, query, searchType });
  }

// No-op functions for compatibility
export async function checkUsageLimit(userId: string) {
  return { canProceed: true, reason: null };
}

export async function decrementAnalysisCount(userId: string) {
  // Hackathon mode: No-op
  return;
}

export async function trackValyuUsage(
  userId: string,
  customerId: string,
  searchCount: number,
  estimatedCost: number
) {
  // Hackathon mode: No-op
  console.log('[Hackathon] Valyu usage:', { searchCount, estimatedCost });
}
