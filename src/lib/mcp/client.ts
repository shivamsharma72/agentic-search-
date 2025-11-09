/**
 * MCP Client for Smithery Polymarket MCP Server
 * Uses the official MCP SDK with session management
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type {
  PolymarketMarket,
  PolymarketEvent,
  PolymarketTag,
  SearchMarketsParams,
  MCPToolResponse,
} from './types';

// Smithery MCP Server URL
const SMITHERY_MCP_URL = 'https://server.smithery.ai/@aryankeluskar/polymarket-mcp/mcp';

/**
 * MCP Client for interacting with Polymarket MCP server
 * Properly manages session lifecycle using MCP SDK
 */
export class PolymarketMCPClient {
  private client: Client;
  private transport: StreamableHTTPClientTransport;
  private serverUrl: string;
  private isConnected: boolean = false;

  constructor(config?: { apiKey?: string; profile?: string }) {
    // Build URL with authentication
    const url = new URL(SMITHERY_MCP_URL);
    
    if (config?.apiKey) {
      url.searchParams.set('api_key', config.apiKey);
    }
    
    if (config?.profile) {
      url.searchParams.set('profile', config.profile);
    }

    this.serverUrl = url.toString();
    
    console.log('🔑 [MCP Client] Initializing with:', {
      hasApiKey: !!config?.apiKey,
      apiKeyPrefix: config?.apiKey?.substring(0, 8) + '...',
      profile: config?.profile,
      serverUrl: this.serverUrl,
    });

    // Create transport and client
    this.transport = new StreamableHTTPClientTransport(this.serverUrl);
    this.client = new Client({
      name: 'Polyseer MCP Client',
      version: '1.0.0',
    }, {
      capabilities: {},
    });
  }

  /**
   * Connect to MCP server (establishes session)
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      await this.client.connect(this.transport);
      this.isConnected = true;
      console.log('✅ [MCP Client] Connected to Smithery Polymarket MCP');
    } catch (error) {
      console.error('❌ [MCP Client] Connection failed:', error);
      throw error;
    }
  }

  /**
   * Ensure connection before making requests
   */
  private async ensureConnected(): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }
  }

  /**
   * Call MCP tool using the proper SDK
   */
  private async callTool<T>(
    toolName: string,
    params: Record<string, any> = {}
  ): Promise<MCPToolResponse<T>> {
    try {
      await this.ensureConnected();

      console.log('🔍 [MCP Tool Call]', {
        tool: toolName,
        params,
      });

      const result = await this.client.callTool({
        name: toolName,
        arguments: params,
      });

      console.log('✅ [MCP Tool Result]', result);

      // Parse the result
      if (result.content && result.content.length > 0) {
        const content = result.content[0];
        if (content.type === 'text') {
          try {
            const data = JSON.parse(content.text);
            return {
              success: true,
              data,
            };
          } catch (e) {
            // If not JSON, return raw text
            return {
              success: true,
              data: content.text as any,
            };
          }
        }
      }

      return {
        success: false,
        error: 'No content in response',
      };
    } catch (error) {
      console.error('💥 [MCP Tool Error]', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Search for Polymarket markets
   */
  async searchMarkets(
    params: SearchMarketsParams
  ): Promise<MCPToolResponse<PolymarketMarket[]>> {
    // Build arguments, filtering out undefined values
    const args: Record<string, any> = {
      limit: params.limit || 10,
      active: params.active !== false,
      order: params.order || 'volume',
    };
    
    // Only include query if it has a value
    // Note: Try without query first to see all markets
    if (params.query && params.query.trim()) {
      args.query = params.query.trim();
    }
    
    // Only include tag if it has a value
    if (params.tag) {
      args.tag = params.tag;
    }
    
    console.log('🔍 [MCP searchMarkets] Final args:', args);
    
    return this.callTool<PolymarketMarket[]>('search_markets', args);
  }

  /**
   * Get market details by slug
   */
  async getMarket(slug: string): Promise<MCPToolResponse<PolymarketMarket>> {
    return this.callTool<PolymarketMarket>('get_market', { slug });
  }

  /**
   * Search for Polymarket events
   */
  async searchEvents(query: string, limit = 10): Promise<MCPToolResponse<PolymarketEvent[]>> {
    return this.callTool<PolymarketEvent[]>('search_events', {
      query,
      limit,
    });
  }

  /**
   * Get event details by slug
   */
  async getEvent(slug: string): Promise<MCPToolResponse<PolymarketEvent>> {
    return this.callTool<PolymarketEvent>('get_event', { slug });
  }

  /**
   * List available tags
   */
  async listTags(limit = 50, offset = 0): Promise<MCPToolResponse<PolymarketTag[]>> {
    return this.callTool<PolymarketTag[]>('list_tags', {
      limit,
      offset,
    });
  }

  /**
   * Close the connection
   */
  async close(): Promise<void> {
    if (this.isConnected) {
      await this.client.close();
      this.isConnected = false;
      console.log('🔌 [MCP Client] Disconnected');
    }
  }
}

/**
 * Create a singleton instance
 */
let mcpClient: PolymarketMCPClient | null = null;

export function getMCPClient(): PolymarketMCPClient {
  if (!mcpClient) {
    mcpClient = new PolymarketMCPClient({
      // Get credentials from environment variables
      apiKey: process.env.SMITHERY_API_KEY || process.env.NEXT_PUBLIC_SMITHERY_API_KEY,
      profile: process.env.SMITHERY_PROFILE || process.env.NEXT_PUBLIC_SMITHERY_PROFILE,
    });
  }
  return mcpClient;
}
