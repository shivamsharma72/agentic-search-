# MCP Server Test

Standalone test script to debug the Smithery Polymarket MCP server.

## Setup

```bash
npm install
```

## Run

```bash
npm test
```

## What it tests

1. **List Tools** - Shows all available tools on the server
2. **List Resources** - Shows all available resources (trending, categories, featured)
3. **search_markets** - Tests the search tool with different queries
4. **Resources** - Tests reading from `polymarket://trending`, `polymarket://categories`, and `polymarket://featured`

## Output

The script will log:
- Available tools and their parameters
- Available resources and their URIs
- Sample search results for different queries
- Resource content

This helps us understand exactly what the MCP server supports and what format it returns data in.

