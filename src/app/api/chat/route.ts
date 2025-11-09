import { NextRequest, NextResponse } from 'next/server';
import { getMCPClient } from '@/lib/mcp/client';

// Switch to Node runtime for MCP SDK compatibility
export const runtime = 'nodejs';

/**
 * Chat API Route - With Streaming Support
 * Handles conversational interactions with Polymarket MCP
 * Routes to /api/forecast for deep analysis when requested
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, action, params } = body;

    console.log('💬 [Chat API] Received:', { message, action, params });

    if (!message && !action) {
      return NextResponse.json(
        { error: 'Message or action is required' },
        { status: 400 }
      );
    }

    const mcpClient = getMCPClient();

    // Handle different actions
    if (action === 'search_markets') {
      const result = await mcpClient.searchMarkets({
        query: message, // Use the user's message as the search query
        ...params, // Merge any additional params
      });
      
      console.log('📊 [Chat API] MCP Result:', JSON.stringify(result, null, 2));
      
      return NextResponse.json(result);
    }

    if (action === 'get_market') {
      if (!params?.slug) {
        return NextResponse.json(
          { error: 'Slug is required for get_market' },
          { status: 400 }
        );
      }
      const result = await mcpClient.getMarket(params.slug);
      return NextResponse.json(result);
    }

    if (action === 'list_tags') {
      const result = await mcpClient.listTags(params?.limit, params?.offset);
      return NextResponse.json(result);
    }

    if (action === 'search_events') {
      const result = await mcpClient.searchEvents(
        params?.query || message,
        params?.limit
      );
      return NextResponse.json(result);
    }

    // Default: interpret message and search markets
    const result = await mcpClient.searchMarkets({
      query: message,
      limit: 10,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Polyseer Chat API',
    description: 'Conversational interface for Polymarket discovery and analysis',
    endpoints: {
      POST: {
        description: 'Send messages or execute actions',
        actions: [
          'search_markets',
          'get_market',
          'search_events',
          'get_event',
          'list_tags',
        ],
      },
    },
    note: 'For deep analysis, markets are sent to /api/forecast',
  });
}

