---
title: Connect to the CockroachDB Cloud MCP Server
summary: Description of the MCP Server, what it does, and a step-by-step guide on how to set it up.
toc: true
---

CockroachDB Cloud includes a managed [Model Context Protocol (MCP)](https://modelcontextprotocol.io/introduction) server that enables AI coding tools such as Claude Code, Cursor, and AI agents to access a cluster. They can securely explore live schemas and run queries against a single selected cluster using OAuth or API key authentication. Users can interact with their cluster using natural language prompts to perform read operations (such as listing databases, querying tables, and exploring schemas) and write operations (such as creating databases and tables, and inserting rows into a table).

Cockroach Labs recommends using OAuth to connect to the Cloud MCP server, as short-lived tokens are more secure than long-lived tokens. However, some automated tooling may require long-lived tokens, and so it is possible to connect to the server using an API key.

This page explains how to connect your AI tools to the CockroachDB Cloud MCP server.

{{site.data.alerts.callout_danger}}
Use caution when granting cluster read/write access to an AI tool or agent, especially on a production cluster. Review your organization's security policies before doing so.
{{site.data.alerts.end}}

## Before you begin

- [Create a CockroachDB cluster]({% link cockroachcloud/create-a-basic-cluster.md %}). 
    - Note the Cluster ID in the URL of the [Cluster Overview Page]({% link cockroachcloud/cluster-overview-page.md %}): `https://cockroachlabs.cloud/cluster/{your_cluster_id}/overview`.
- If you plan to connect to the MCP server using OAuth, ensure that the user managing the MCP server connection [is able to log in]({% link cockroachcloud/authentication.md %}) to the Cloud Console. Ensure that the user has been assigned the [Cluster Admin]({% link cockroachcloud/authorization.md %}#cluster-admin) role or the [Cluster Operator]({% link cockroachcloud/authorization.md %}#cluster-operator) role.
- If you plan to connect to the MCP server using an API key, create a [service account]({% link cockroachcloud/managing-access.md %}#manage-service-accounts) and an [API key]({% link cockroachcloud/managing-access.md %}#api-access) in the CockroachDB Cloud Console. Ensure that the service account has been assigned the [Cluster Admin]({% link cockroachcloud/authorization.md %}#cluster-admin) role or the [Cluster Operator]({% link cockroachcloud/authorization.md %}#cluster-operator) role.
  - Copy the secret key that's generated upon service account creation.

## Connect to the MCP Server

### Step 1. Choose your authentication method

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="oauth">OAuth</button>
    <button class="filter-button" data-scope="api">API Key</button>
</div>

### Step 2. Update tool configuration

Cockroach Labs enables access to its CockroachDB Cloud MCP server via HTTP transport.

<section class="filter-content" markdown="1" data-scope="oauth">
Different AI tools might have slightly different ways of connecting to an MCP server via HTTP. This will normally involve adding a JSON snippet to a configuration file, which will include:

- The MCP server URL: `https://cockroachlabs.cloud/mcp`
- Your Cluster ID
</section>

<section class="filter-content" markdown="1" data-scope="api">
Different AI tools might have slightly different ways of connecting to an MCP server via HTTP. This will normally involve adding a JSON snippet to a configuration file, which will include:

- The MCP server URL: `https://cockroachlabs.cloud/mcp`
- Your Cluster ID
- A header containing a bearer token: `"Authorization: Bearer {your-service-account-api-key}"`. This should contain the secret key generated when creating your service account.
</section>

The specific JSON snippet might look slightly different for each tool, and the tool might offer CLI commands to simplify the configuration process. 

The following are instructions for how to update the configuration of some common AI tools. For other tools, read the documentation for those tools.

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="claude">Claude Code</button>
    <button class="filter-button" data-scope="cursor">Cursor</button>
    <button class="filter-button" data-scope="cline">Cline</button>
    <button class="filter-button" data-scope="copilot">Github Copilot</button>
</div>

<section class="filter-content" markdown="1" data-scope="claude">
<section class="filter-content" markdown="1" data-scope="oauth">

#### Option 1. Use the Claude CLI

1. Copy the following command:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    claude mcp add cockroachdb-cloud https://cockroachlabs.cloud/mcp --transport http --header "mcp-cluster-id: {your-cluster-id}"
    ~~~

2. Paste the command in your terminal, replacing the `{your-cluster-id}` placeholder. Run the command.

#### Option 2: Manually modify JSON

1. Copy the following JSON snippet:

    {% include_cached copy-clipboard.html %}
    ~~~json
    "cockroachdb-cloud": {
      "type": "http",
      "url": "https://cockroachlabs.cloud/mcp",
      "headers": {
        "mcp-cluster-id": "{your-cluster-id}"
      }
    }
    ~~~

2. Open `.claude.json`.

3. Find `"mcpServers"`. Include the JSON snippet in the list of MCP servers, replacing the `{your-cluster-id}` placeholder.

4. Restart Claude Code.

</section>

<section class="filter-content" markdown="1" data-scope="api">

#### Option 1. Use the Claude CLI
1. Copy the following command:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    claude mcp add cockroachdb-cloud https://cockroachlabs.cloud/mcp --transport http --header "mcp-cluster-id: {your-cluster-id}" --header "Authorization: Bearer {your-cluster-id}"
    ~~~

2. Paste the command in your terminal, replacing the `{your-cluster-id}` and `{your-service-account-api-key}` placeholders. Run the command.

#### Option 2: Manually modify JSON

1. Copy the following JSON snippet:

    {% include_cached copy-clipboard.html %}
    ~~~json
    "cockroachdb-cloud": {
      "type": "http",
      "url": "https://cockroachlabs.cloud/mcp",
      "headers": {
        "mcp-cluster-id": "{your-cluster-id}",
        "Authorization": "Bearer {your-service-account-api-key}"
      }
    }
    ~~~

2. Open `.claude.json`.

3. Find `"mcpServers"`. Include the JSON snippet in the list of MCP servers, replacing the `{your-cluster-id}` and `{your-service-account-api-key}` placeholders.

4. Restart Claude Code.

</section>
</section>

<section class="filter-content" markdown="1" data-scope="cursor">
<section class="filter-content" markdown="1" data-scope="oauth">

#### Option 1: Automatic installation

1. Navigate to the [Cluster Overview Page]({% link cockroachcloud/cluster-overview-page.md %}) for the cluster that you want to manage with the MCP server connection.
2. Select **Connect**, then the **Model Context Protocol (MCP)** tab.
3. Select **Cursor** as the MCP Client.
4. Select **Add to Cursor**.

#### Option 2: Manually modify JSON

1. Copy the following JSON snippet:

    {% include_cached copy-clipboard.html %}
    ~~~json
    "cockroachdb-cloud": {
      "url": "https://cockroachlabs.cloud/mcp",
      "headers": {
        "mcp-cluster-id": "{your-cluster-id}"
      }
    }
    ~~~

2. Open `.cursor/mcp.json`.

3. Find `"mcpServers"`. Include the JSON snippet in the list of MCP servers, replacing the `{your-cluster-id}` placeholder.

4. Restart Cursor.
</section>

<section class="filter-content" markdown="1" data-scope="api">
1. Copy the following JSON snippet:

    {% include_cached copy-clipboard.html %}
    ~~~json
    "cockroachdb-cloud": {
      "url": "https://cockroachlabs.cloud/mcp",
      "headers": {
        "mcp-cluster-id": "{your-cluster-id}",
        "Authorization": "Bearer {your-service-account-api-key}"
      }
    }
    ~~~

2. Open `.cursor/mcp.json`.

3. Find `"mcpServers"`. Include the JSON snippet in the list of MCP servers, replacing the `{your-cluster-id}` and `{your-service-account-api-key}` placeholders.

4. Restart Cursor.
</section>
</section>

<section class="filter-content" markdown="1" data-scope="cline">
<section class="filter-content" markdown="1" data-scope="oauth">
1. Copy the following JSON snippet:

    {% include_cached copy-clipboard.html %}
    ~~~json
    "cockroachdb-cloud": {
      "type": "streamableHttp",
      "url": "https://cockroachlabs.cloud/mcp",
      "headers": {
        "mcp-cluster-id": "{your-cluster-id}"
      }
    }
    ~~~

2. Open `cline_mcp_settings.json`.

3. Find `"mcpServers"`. Include the JSON snippet in the list of MCP servers, replacing the `{your-cluster-id}` placeholder.

4. Restart Cline.
</section>

<section class="filter-content" markdown="1" data-scope="api">
1. Copy the following JSON snippet:

    {% include_cached copy-clipboard.html %}
    ~~~json
    "cockroachdb-cloud": {
      "type": "streamableHttp",
      "url": "https://cockroachlabs.cloud/mcp",
      "headers": {
        "mcp-cluster-id": "{your-cluster-id}",
        "Authorization": "Bearer {your-service-account-api-key}"
      }
    }
    ~~~

2. Open `cline_mcp_settings.json`.

3. Find `"mcpServers"`. Include the JSON snippet in the list of MCP servers, replacing the `{your-cluster-id}` and `{your-service-account-api-key}` placeholders.

4. Restart Cline.
</section>
</section>

<section class="filter-content" markdown="1" data-scope="copilot">
<section class="filter-content" markdown="1" data-scope="oauth">

#### Option 1: Automatic installation

1. Navigate to the [Cluster Overview Page]({% link cockroachcloud/cluster-overview-page.md %}) for the cluster that you want to manage with the MCP server connection.
2. Select **Connect**, then the **Model Context Protocol (MCP)** tab.
3. Select **GitHub Copilot** as the MCP Client.
4. Select **Add to GitHub Copilot**.

#### Option 2: Manually modify JSON

1. Copy the following JSON snippet:

    {% include_cached copy-clipboard.html %}
    ~~~json
    "cockroachdb-cloud": {
      "type": "http",
      "url": "https://cockroachlabs.cloud/mcp",
      "headers": {
        "mcp-cluster-id": "{your-cluster-id}"
      }
    }
    ~~~

2. Open `.vscode/mcp.json`.

3. Find `"servers"`. Include the JSON snippet in the list of MCP servers, replacing the `{your-cluster-id}` placeholder.

4. Restart GitHub Copilot.
</section>

<section class="filter-content" markdown="1" data-scope="api">
1. Copy the following JSON snippet:

    {% include_cached copy-clipboard.html %}
    ~~~json
    "cockroachdb-cloud": {
      "type": "http",
      "url": "https://cockroachlabs.cloud/mcp",
      "headers": {
        "mcp-cluster-id": "{your-cluster-id}",
        "Authorization": "Bearer {your-service-account-api-key}"
      }
    }
    ~~~

2. Open `.vscode/mcp.json`.

3. Find `"servers"`. Include the JSON snippet in the list of MCP servers, replacing the `{your-cluster-id}` and `{your-service-account-api-key}` placeholders.

4. Restart GitHub Copilot.
</section>
</section>

While it's possible to use multiple MCP server connections to connect your tool to multiple clusters at once, or to connect to the same cluster using different authentication methods, Cockroach Labs recommends connecting to just one single cluster using one authentication method.

### Step 3. Connect and authenticate

<section class="filter-content" markdown="1" data-scope="oauth">
<section class="filter-content" markdown="1" data-scope="claude">
1. After configuring the MCP server, run the following command in your terminal:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    claude /mcp
    ~~~

2. Select the new server configuration `cockroachdb-cloud` and select **Authenticate**.

3. If you are a member of multiple CockroachDB Cloud [organizations]({% link cockroachcloud/authorization.md %}), you wil be directed to the **Organization Selection** modal in your browser. Select the organization associated with the cluster that you have included in the tool configuration.

4. You will be directed to the **Authorize MCP Access** modal in your browser. This modal will ask you to grant read and/or write permissions to this MCP server connection. Select one or both options, then click **Authorize**.
</section>
<section class="filter-content" markdown="1" data-scope="cursor">
1. After configuring the MCP server, use the Cursor interface to access MCP server connection settings.

2. Select the new server configuration `cockroachdb-cloud` and select **Authenticate**.

3. If you are a member of multiple CockroachDB Cloud [organizations]({% link cockroachcloud/authorization.md %}), you wil be directed to the **Organization Selection** modal in your browser. Select the organization associated with the cluster that you have included in the tool configuration.

4. You will be directed to the **Authorize MCP Access** modal in your browser. This modal will ask you to grant read and/or write permissions to this MCP server connection. Select one or both options, then click **Authorize**.
</section>
<section class="filter-content" markdown="1" data-scope="cline">
1. After configuring the MCP server, use the Cline interface to access MCP server connection settings.

2. Select the new server configuration `cockroachdb-cloud` and select **Authenticate**.

3. If you are a member of multiple CockroachDB Cloud [organizations]({% link cockroachcloud/authorization.md %}), you wil be directed to the **Organization Selection** modal in your browser. Select the organization associated with the cluster that you have included in the tool configuration.

4. You will be directed to the **Authorize MCP Access** modal in your browser. This modal will ask you to grant read and/or write permissions to this MCP server connection. Select one or both options, then click **Authorize**.
</section>
<section class="filter-content" markdown="1" data-scope="copilot">
1. After configuring the MCP server, use the GitHub Copilot interface to access MCP server connection settings.

2. Select the new server configuration `cockroachdb-cloud` and select **Authenticate**.

3. If you are a member of multiple CockroachDB Cloud [organizations]({% link cockroachcloud/authorization.md %}), you wil be directed to the **Organization Selection** modal in your browser. Select the organization associated with the cluster that you have included in the tool configuration.

4. You will be directed to the **Authorize MCP Access** modal in your browser. This modal will ask you to grant read and/or write permissions to this MCP server connection. Select one or both options, then click **Authorize**.
</section>
</section>

<section class="filter-content" markdown="1" data-scope="api">
If the provided API key is active, there should be no futher authorization steps. The MCP server connection's access permissions are determined by the [role(s)]({% link cockroachcloud/authorization.md %}#organization-user-roles) associated with this service account.
</section>

## Use the MCP server

The CockroachDB Cloud MCP server provides several tools that enable you to **read** cluster data and metadata:

| Tool | Description |
|------|-------------|
| `list_clusters` | List all accessible clusters. |
| `get_cluster` | Get detailed cluster information. |
| `list_databases` | List databases in the cluster. |
| `list_tables` | List tables in a database. |
| `get_table_schema` | Get detailed schema for a table. |
| `select_query` | Execute a [`SELECT`]({% link {{site.current_cloud_version}}/select-clause.md %}) statement. |
| `explain_query` | Execute an [`EXPLAIN`]({% link {{site.current_cloud_version}}/explain.md %}) statement. |
| `show_running_queries` | List currently executing queries. |

There are also several tools that enable you to **write** cluster data:

| Tool | Description |
|------|-------------|
| `create_database` | Create a new database. |
| `create_table` | Create a new table. |
| `insert_rows` | Insert rows into a table. |

The tool will only read or write to the cluster specified by the configuration that you updated in [Step 2](#step-2-update-tool-configuration).

Use natural language prompts to read from and write to the cluster. These prompts do not need to reference the names of the tools. Prompts can be simple, for example:

~~~
List all of the tables in the movr database.
~~~

They can also be complex and conversational, for example:

~~~
I need to add a service appointments table to the movr database. I need to track when customers schedule service appointments for their vehicles.

For the schema, I'm thinking we need:
- Appointment ID (primary key)
- Customer reference (foreign key to movr.customers)
- Vehicle reference (foreign key to movr.vehicles)
- Appointment date/time
- Service type (oil change, inspection, repair, etc.)
- Status (scheduled, completed, cancelled, no-show)
- Assigned technician (foreign key to movr.technicians)
- Estimated cost
- Notes

Let's include a secondary index on the status column.

Show me the CREATE TABLE statement so that we can talk it through before you actually create the table.
~~~

## See also

- [Agent Skills for CockroachDB]({% link {{site.current_cloud_version}}/agent-skills.md %})
- [Docs MCP Server]({% link {{site.current_cloud_version}}/docs-mcp-integration.md %})
- [Schema Design Overview]({% link {{site.current_cloud_version}}/schema-design-overview.md %})
- [Managing Access]({% link cockroachcloud/managing-access.md %})
- [Authorization]({% link cockroachcloud/authorization.md %})
- [`SELECT`]({% link {{site.current_cloud_version}}/select-clause.md %})
- [`EXPLAIN`]({% link {{site.current_cloud_version}}/explain.md %})