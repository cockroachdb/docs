---
title: CockroachDB Docs MCP Server
summary: Connect to CockroachDB documentation directly from your IDE or AI assistant
toc: true
docs_area: reference
---

The CockroachDB Docs MCP Server ([Model Context Protocol](https://modelcontextprotocol.io/introduction)) enables AI assistants like Claude Desktop, Cursor, and VS Code to access CockroachDB documentation directly. This integration allows you to get instant, context-aware answers about CockroachDB without leaving your development environment.

## Setup

Connect your AI assistant to CockroachDB documentation by configuring the MCP server. Choose your platform below for specific instructions.

### Cursor

1. Open Cursor Settings (⌘+,)
2. Navigate to **Models** → **Model Context Protocol**
3. Add the following configuration:

    ```json
    {
      "mcpServers": {
        "cockroachdb-docs": {
          "command": "npx",
          "args": ["-y", "@modelcontextprotocol/server-everything", "https://cockroachdb.mcp.kapa.ai"]
        }
      }
    }
    ```

4. Restart Cursor to apply the configuration
5. You can now ask questions about CockroachDB documentation directly in Cursor

### VS Code

1. Install the [Claude Code for VS Code](https://marketplace.visualstudio.com/items?itemName=anthropic.claude-code) extension
2. Open VS Code Settings (⌘+,)
3. Search for "Claude MCP"
4. Add the following to your MCP configuration:

    ```json
    {
      "claude.mcpServers": {
        "cockroachdb-docs": {
          "command": "npx",
          "args": ["-y", "@modelcontextprotocol/server-everything", "https://cockroachdb.mcp.kapa.ai"]
        }
      }
    }
    ```

5. Reload VS Code window (⌘+R)
6. The CockroachDB documentation is now available through Claude in VS Code

### Claude Code

1. Open Claude Code settings
2. Navigate to MCP Servers configuration
3. Add the CockroachDB Docs server:

    ```json
    {
      "mcpServers": {
        "cockroachdb-docs": {
          "command": "npx",
          "args": ["-y", "@modelcontextprotocol/server-everything", "https://cockroachdb.mcp.kapa.ai"]
        }
      }
    }
    ```

4. Restart Claude Code
5. CockroachDB documentation is now accessible in your Claude Code environment

### ChatGPT Desktop

{{site.data.alerts.callout_info}}
MCP support for ChatGPT Desktop is coming soon. Check back for updates.
{{site.data.alerts.end}}

### Claude Desktop

1. Open Claude Desktop configuration file:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

2. Add the CockroachDB Docs MCP server to your configuration:

    ```json
    {
      "mcpServers": {
        "cockroachdb-docs": {
          "command": "npx",
          "args": ["-y", "@modelcontextprotocol/server-everything", "https://cockroachdb.mcp.kapa.ai"]
        }
      }
    }
    ```

3. Save the file and restart Claude Desktop
4. You can now query CockroachDB documentation directly in Claude Desktop

### Other

For other MCP-compatible clients, use the following server configuration:

**Server URL**: `https://cockroachdb.mcp.kapa.ai`

**Generic configuration format**:

```json
{
  "servers": [{
    "name": "cockroachdb-docs",
    "url": "https://cockroachdb.mcp.kapa.ai"
  }]
}
```

Consult your client's documentation for specific configuration instructions.

## Capabilities

Once connected, your AI assistant can answer questions about CockroachDB directly from the official documentation. Example queries include:

### Multi-Region Configuration
- "How do I set up a multi-region CockroachDB cluster?"
- "What are the best practices for configuring region survival goals?"
- "Show me how to implement follow-the-workload patterns"

### Performance Optimization
- "What are the recommended techniques for optimizing query performance?"
- "How do I identify and resolve hot spots in my cluster?"
- "Explain the best practices for index design in CockroachDB"

### Security Features
- "How do I configure TLS/SSL encryption for my cluster?"
- "What are the steps to implement role-based access control?"
- "Show me how to set up audit logging in CockroachDB"

### SQL Syntax and Features
- "What's the syntax for creating a changefeed?"
- "How do I use window functions in CockroachDB?"
- "Explain the differences between JSONB operators in CockroachDB"

### Troubleshooting
- "How do I diagnose and fix connection refused errors?"
- "What steps should I take when encountering transaction retry errors?"
- "How do I investigate and resolve node liveness issues?"

### Operations and Maintenance
- "What's the recommended backup strategy for production clusters?"
- "How do I perform a rolling upgrade of my cluster?"
- "Show me the best practices for monitoring CockroachDB"

## Troubleshooting

### Connection Issues

If your AI assistant cannot connect to the CockroachDB documentation:

1. Verify your internet connection
2. Check that the MCP server URL is correctly configured: `https://cockroachdb.mcp.kapa.ai`
3. Restart your AI assistant application
4. Ensure you have the latest version of your AI assistant

### No Results

If queries return no results:

1. Try rephrasing your question to be more specific
2. Include "CockroachDB" in your query for better context
3. Check the [CockroachDB documentation](https://www.cockroachlabs.com/docs/) directly to verify the information exists

### Configuration Not Working

If the configuration doesn't seem to take effect:

1. Ensure the configuration file is saved in the correct location
2. Check for JSON syntax errors in your configuration
3. Fully quit and restart your application (not just reload)
4. Verify that `npx` is available in your system `PATH`

## Feedback and Support

For issues or feedback about the CockroachDB Docs MCP Server:

- Report documentation issues on [GitHub](https://github.com/cockroachdb/docs/issues)
- Join the [CockroachDB Community Slack](https://www.cockroachlabs.com/join-community/) for help

## See Also

- [Model Context Protocol](https://modelcontextprotocol.io/)