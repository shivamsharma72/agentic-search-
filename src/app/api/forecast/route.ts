import { NextRequest, NextResponse } from 'next/server';
import { runUnifiedForecastPipeline } from '@/lib/agents/orchestrator';
import { parseMarketUrl, isValidMarketUrl } from '@/lib/tools/market-url-parser';

export const maxDuration = 800;

export async function POST(req: NextRequest) {
  // Hackathon Mode: No authentication, no rate limits
  try {

    const body = await req.json();
    const {
      polymarketSlug, // Legacy support
      marketUrl, // New unified support
      drivers = [],
      historyInterval = '1d',
      withBooks = true,
      withTrades = false
    } = body;

    // Determine which parameter was provided and validate
    let finalMarketUrl: string;
    let identifier: string;

    if (marketUrl) {
      // Polymarket URL support
      if (typeof marketUrl !== 'string' || !marketUrl) {
        return NextResponse.json(
          { error: 'marketUrl must be a non-empty string' },
          { status: 400 }
        );
      }

      if (!isValidMarketUrl(marketUrl)) {
        const parsed = parseMarketUrl(marketUrl);
        return NextResponse.json(
          { error: parsed.error || 'Invalid market URL. Only Polymarket URLs are supported.' },
          { status: 400 }
        );
      }

      finalMarketUrl = marketUrl;
      const parsed = parseMarketUrl(marketUrl);
      identifier = parsed.identifier;
    } else if (polymarketSlug) {
      // Legacy support - convert Polymarket slug to URL
      if (typeof polymarketSlug !== 'string' || !polymarketSlug) {
        return NextResponse.json(
          { error: 'polymarketSlug must be a non-empty string' },
          { status: 400 }
        );
      }

      finalMarketUrl = `https://polymarket.com/event/${polymarketSlug}`;
      identifier = polymarketSlug;
    } else {
      return NextResponse.json(
        { error: 'Either marketUrl or polymarketSlug is required' },
        { status: 400 }
      );
    }

    // Hackathon Mode: No usage tracking or session management

    // Create a ReadableStream for Server-Sent Events
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        // Helper function to send SSE event
        const sendEvent = (data: any, event?: string) => {
          const eventData = event ? `event: ${event}\n` : '';
          const payload = `${eventData}data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        };

        // Track all analysis steps for storage
        const analysisSteps: any[] = [];

        try {
          // Send initial connection event
          sendEvent({ type: 'connected', message: 'Starting analysis...' });

          // Create progress callback for the orchestrator
          const onProgress = (step: string, details: any) => {
            // Store step for history
            analysisSteps.push({
              step,
              details,
              timestamp: new Date().toISOString()
            });

            sendEvent({
              type: 'progress',
              step,
              details,
              timestamp: new Date().toISOString()
            }, 'progress');
          };

          // Run forecasting pipeline with progress tracking
          const forecastCard = await runUnifiedForecastPipeline({
            marketUrl: finalMarketUrl,
            drivers,
            historyInterval,
            withBooks,
            withTrades,
            onProgress
          });

          // Send final result
          sendEvent({
            type: 'complete',
            forecast: forecastCard,
            timestamp: new Date().toISOString()
          }, 'complete');

        } catch (error) {
          console.error('Error in forecast API:', error);
          
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          
          sendEvent({
            type: 'error',
            error: errorMessage,
            details: error instanceof Error ? error.stack : 'No stack trace available',
            timestamp: new Date().toISOString()
          }, 'error');
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    });

  } catch (error) {
    console.error('Error setting up forecast stream:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Polymarket Forecasting API',
    description: 'AI-powered forecasting using Claude Sonnet 4.5 agents - Polymarket prediction markets',
    usage: 'POST with { marketUrl: string, drivers?: string[], historyInterval?: string, withBooks?: boolean, withTrades?: boolean }',
    parameters: {
      marketUrl: 'Required. Full Polymarket URL.',
      polymarketSlug: 'Deprecated. Use marketUrl instead. Still supported for backward compatibility.',
      drivers: 'Optional. Key factors to focus analysis on. Auto-generated if not provided.',
      historyInterval: 'Optional. Price history granularity ("1h", "4h", "1d", "1w"). Auto-optimized if not provided.',
      withBooks: 'Optional. Include order book data (default: true)',
      withTrades: 'Optional. Include recent trades (default: false)'
    },
    supportedPlatforms: {
      polymarket: {
        name: 'Polymarket',
        urlFormat: 'https://polymarket.com/event/{slug}',
        example: 'https://polymarket.com/event/will-trump-win-2024'
      }
    },
    autoGeneration: {
      drivers: 'System automatically analyzes the market question and generates relevant drivers using Claude',
      historyInterval: 'System selects optimal interval based on market volume, time until close, and volatility'
    },
    examples: {
      simple: {
        marketUrl: 'https://polymarket.com/event/will-ai-achieve-agi-by-2030'
      },
      withCustomization: {
        marketUrl: 'https://polymarket.com/event/will-trump-win-2024',
        drivers: ['Polling data', 'Economic indicators', 'Swing states'],
        historyInterval: '4h'
      }
    }
  });
}