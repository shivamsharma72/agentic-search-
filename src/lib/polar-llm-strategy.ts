import { Ingestion } from '@polar-sh/ingestion';
import { LLMStrategy } from '@polar-sh/ingestion/strategies/LLM';
import { anthropic } from '@ai-sdk/anthropic';
import { groq } from '@ai-sdk/groq';

// Store current analysis context for LLM tracking
let currentUserContext: { userId?: string; customerId?: string } = {};

export function setLLMContext(userId: string, customerId: string) {
  currentUserContext = { userId, customerId };
  console.log(`[PolarLLM] Context set for user: ${userId}, customer: ${customerId}`);
}

export function clearLLMContext() {
  currentUserContext = {};
  console.log('[PolarLLM] Context cleared');
}

// Map legacy model names to Claude models
function mapModelName(modelName: string): string {
  const modelMap: Record<string, string> = {
    'gpt-5': 'claude-sonnet-4-5',
    'gpt-5-mini': 'claude-sonnet-4-5',
    'gpt-4': 'claude-sonnet-4-5',
    'gpt-4-turbo': 'claude-opus-4',
    'claude-3-5-sonnet-20241022': 'claude-sonnet-4-5', // Retired model
    'claude-3-5-sonnet-20240620': 'claude-sonnet-4-5', // Retired Oct 28, 2025
  };
  
  return modelMap[modelName] || modelName;
}

// Get a wrapped model for the current context
export function getPolarTrackedModel(modelName: string = 'claude-sonnet-4-5') {
  // Hackathon Mode: No Polar tracking, just return the model
  // Map legacy GPT model names to Claude equivalents
  const claudeModelName = mapModelName(modelName);
  
  const baseModel = anthropic(claudeModelName);
  
  console.log(`[Hackathon] Mapped ${modelName} -> ${claudeModelName}`);
    return baseModel;
  }
