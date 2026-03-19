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

1. Create or open the file `.cursor/mcp.json` in your project directory
2. Add the following configuration:

    ```json
    {
      "mcpServers": {
        "cockroachdb-docs": {
          "type": "http",
          "url": "https://cockroachdb.mcp.kapa.ai"
        }
      }
    }
    ```

3. Restart Cursor to apply the configuration
4. You can now ask questions about CockroachDB documentation directly in Cursor

### VS Code

{{site.data.alerts.callout_info}}
Requires VS Code 1.102 or later with GitHub Copilot.
{{site.data.alerts.end}}

1. Create or open the file `.vscode/mcp.json` in your project directory
2. Add the following configuration:

    ```json
    {
      "servers": {
        "cockroachdb-docs": {
          "type": "http",
          "url": "https://cockroachdb.mcp.kapa.ai"
        }
      }
    }
    ```

3. Reload VS Code window (⌘+R)
4. The CockroachDB documentation is now available through GitHub Copilot in VS Code

### Claude Code

1. Run the following command in your terminal:

    ```shell
    claude mcp add --transport http cockroachdb-docs https://cockroachdb.mcp.kapa.ai
    ```

2. Execute `/mcp` in Claude Code and authenticate via browser when prompted
3. CockroachDB documentation is now accessible in your Claude Code environment

### ChatGPT Desktop

1. Open ChatGPT Desktop
2. Go to **Settings** → **Features** and enable **Developer mode**
3. Navigate to **Settings** → **MCP Servers**
4. Click **Add Server** and enter:
   - **Name**: `cockroachdb-docs`
   - **URL**: `https://cockroachdb.mcp.kapa.ai`
5. CockroachDB documentation is now accessible in ChatGPT Desktop

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
          "type": "npx",
          "args": ["mcp-remote", "https://cockroachdb.mcp.kapa.ai"]
        }
      }
    }
    ```

3. Save the file and restart Claude Desktop
4. You can now query CockroachDB documentation directly in Claude Desktop

### Other MCP Clients

For other MCP-compatible clients, use the following server configuration:

**Server URL**: `https://cockroachdb.mcp.kapa.ai`

**Generic configuration format**:

```json
{
  "mcpServers": {
    "cockroachdb-docs": {
      "url": "https://cockroachdb.mcp.kapa.ai"
    }
  }
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
4. For Claude Desktop: Verify that `npx` is available in your system `PATH`

## Feedback and Support

For issues or feedback about the CockroachDB Docs MCP Server:

- Report documentation issues on [GitHub](https://github.com/cockroachdb/docs/issues)
- Join the [CockroachDB Community Slack](https://www.cockroachlabs.com/join-community/) for help

## See Also

- [Model Context Protocol](https://modelcontextprotocol.io/)