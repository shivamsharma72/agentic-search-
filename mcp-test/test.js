/**
 * Standalone MCP Server Test
 * Tests the Smithery Polymarket MCP server independently
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

// MCP Server Configuration
const SMITHERY_API_KEY = '7fff3288-e676-4512-89fd-0d974f1cf06e';
const SMITHERY_PROFILE = 'mcp';
const MCP_SERVER_URL = 'https://server.smithery.ai/@aryankeluskar/polymarket-mcp/mcp';

console.log('🧪 ========================================');
console.log('   MCP SERVER TEST - STANDALONE');
console.log('========================================\n');

async function testMCPServer() {
  try {
    // Build authenticated URL
    const url = new URL(MCP_SERVER_URL);
    url.searchParams.set('api_key', SMITHERY_API_KEY);
    url.searchParams.set('profile', SMITHERY_PROFILE);
    
    console.log('🔗 Server URL:', url.toString().replace(SMITHERY_API_KEY, '***'));
    console.log('');
    
    // Create transport and client
    console.log('📡 Creating MCP client...');
    const transport = new StreamableHTTPClientTransport(url.toString());
    const client = new Client({
      name: 'MCP Test Client',
      version: '1.0.0',
    }, {
      capabilities: {},
    });
    
    // Connect
    console.log('🔌 Connecting to MCP server...');
    await client.connect(transport);
    console.log('✅ Connected!\n');
    
    // Test 1: List available tools
    console.log('📋 TEST 1: List Available Tools');
    console.log('================================');
    const toolsResult = await client.listTools();
    console.log('Available tools:', toolsResult.tools?.length || 0);
    toolsResult.tools?.forEach((tool, i) => {
      console.log(`${i + 1}. ${tool.name}`);
      console.log(`   Description: ${tool.description}`);
      if (tool.inputSchema) {
        console.log(`   Parameters:`, JSON.stringify(tool.inputSchema, null, 2));
      }
    });
    console.log('');
    
    // Test 2: List available resources
    console.log('📚 TEST 2: List Available Resources');
    console.log('===================================');
    const resourcesResult = await client.listResources();
    console.log('Available resources:', resourcesResult.resources?.length || 0);
    resourcesResult.resources?.forEach((resource, i) => {
      console.log(`${i + 1}. ${resource.uri}`);
      console.log(`   Name: ${resource.name}`);
      console.log(`   Description: ${resource.description}`);
      console.log(`   MIME Type: ${resource.mimeType}`);
    });
    console.log('');
    
    // Test 3: Try search_markets with different queries
    console.log('🔍 TEST 3: search_markets Tool');
    console.log('==============================');
    
    const queries = [
      'AI breakthrough',
      'crypto',
      'trump',
      '', // Empty query
    ];
    
    for (const query of queries) {
      console.log(`\n📊 Query: "${query || '(empty)'}"`);
      console.log('---');
      
      try {
        const params = {
          limit: 5,
          active: true,
          order: 'volume',
        };
        
        if (query) {
          params.query = query;
        }
        
        console.log('Parameters:', JSON.stringify(params, null, 2));
        
        const result = await client.callTool({
          name: 'search_markets',
          arguments: params,
        });
        
        console.log('\nResult:');
        if (result.content && result.content.length > 0) {
          result.content.forEach(content => {
            if (content.type === 'text') {
              console.log(content.text);
            }
          });
        }
        
        if (result.isError) {
          console.log('⚠️  This was an error response');
        }
      } catch (error) {
        console.error('❌ Error:', error.message);
      }
    }
    
    // Test 4: Try resources
    console.log('\n\n📖 TEST 4: Resources');
    console.log('====================');
    
    const resourceURIs = [
      'polymarket://trending',
      'polymarket://categories',
      'polymarket://featured',
    ];
    
    for (const uri of resourceURIs) {
      console.log(`\n📚 Resource: ${uri}`);
      console.log('---');
      
      try {
        const result = await client.readResource({ uri });
        
        console.log('\nResult:');
        if (result.contents && result.contents.length > 0) {
          result.contents.forEach(content => {
            console.log('URI:', content.uri);
            console.log('MIME Type:', content.mimeType);
            if (content.text) {
              console.log('Content:', content.text.substring(0, 500));
              if (content.text.length > 500) {
                console.log('... (truncated)');
              }
            }
          });
        }
      } catch (error) {
        console.error('❌ Error:', error.message);
      }
    }
    
    // Close connection
    console.log('\n\n🔌 Closing connection...');
    await client.close();
    console.log('✅ Test complete!\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
console.log('🚀 Starting MCP server tests...\n');
testMCPServer().catch(console.error);

