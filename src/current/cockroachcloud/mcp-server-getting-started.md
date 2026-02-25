---
title: Connect to the CockroachDB Cloud MCP Server
summary: Description of the MCP Server, what it does, and a step-by-step guide on how to set it up.
toc: true
---

CockroachDB Cloud includes a managed Model Context Protocol (MCP) server that enables AI coding tools such as Claude, VS Code, Cursor and AI agents to access a cluster. They can securely explore live schemas and run queries against a single selected cluster using OAuth or API key authentication.

[More about what this server enables]

This page explains how to connect your AI tools to the CockroachDB Cloud MCP server.

## Before you begin

- Create a [service account]({% link cockroachcloud/managing-access.md %}#manage-service-accounts) and [API key]({% link cockroachcloud/managing-access.md %}#api-access) in the CockroachDB Cloud Console. Ensure that the service account has been [assigned roles]({% link cockroachcloud/authorization.md %}#organization-user-roles) that will enable your AI tools to perform desired actions.

## Step 1. Update tool configuration

Cockroach Labs enables access to its CockroachDB Cloud MCP server via HTTP.

Different AI tools might have slightly different ways of connecting to an MCP server via HTTP. This will normally involve adding a JSON snippet to a configuration file, which will look something like this:

~~~json
"cockroachdb-cloud": {
  "type": "http",
  "url": "https://management-staging.crdb.io/mcp",
  "headers": {
    "Authorization": "Bearer {service-account-api-key}"
  }
}
~~~

Replace the `{service-account-api-key}` placeholder with the API key generated for your CockroachDB Cloud service account.

The specific JSON snippet might look slightly different for each tool, and the tool might offer CLI commands to simplify the configuration process. Review the documentation for the tool to understand how to configure it.


## Step 2. Authenticate and connect

{{site.data.alerts.callout_danger}}
Use caution when granting cluster read/write access to an AI tool or agent, especially on a production cluster. Review your organization's security policies before doing so.
{{site.data.alerts.end}}

## Step 3. Use the MCP server

## See also