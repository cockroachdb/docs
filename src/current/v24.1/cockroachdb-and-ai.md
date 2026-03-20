---
title: CockroachDB and AI
summary: Overview of CockroachDB's capabilities for AI applications and AI-assisted development
toc: true
docs_area: ai_tools
---

CockroachDB supports AI in two primary ways: as a platform for AI-assisted development and as a data store for AI applications.

**Support for AI-assisted development**: CockroachDB integrates with AI development tools, including Claude Code, Cursor, and GitHub Copilot in VS Code. MCP servers provide access to CockroachDB Cloud clusters and CockroachDB documentation. The Agent Skills repository encodes operational workflows in a machine-executable format. The `ccloud` command-line interface (CLI) provides programmatic access to CockroachDB Cloud. These tools enable management, deployment, and development of CockroachDB clusters and applications using natural language prompts and AI-assisted workflows. For more information, refer to [Support for AI-assisted development](#support-for-ai-assisted-development).

**A data store for AI applications**: CockroachDB can serve as the system of record for AI applications. It combines strongly consistent transactions, horizontal scalability, and multi-region deployments. These capabilities support storing agent state, conversation histories, and other AI-related data alongside relational data. For more information, refer to [CockroachDB as a data store for AI applicatons](#cockroachdb-as-a-data-store-for-ai-applications). 

## Support for AI-assisted development

CockroachDB enables your AI development tools to work directly with CockroachDB and CockroachDB Cloud. It supports:

- Cluster-level read and write access via the CockroachDB Cloud MCP server.
- Operational workflows encoded as Agent Skills for CockroachDB.
- Command-line automation with the [`ccloud` CLI]({% link cockroachcloud/ccloud-get-started.md %}), designed to be compatible with AI agents.
- Access to the Cockroach Labs public documentation via the [CockroachDB Docs MCP server]({% link {{ page.version.version }}/docs-mcp-integration.md %}).

The following sections provide an overview of these tools and how they support AI-assisted deployment and maintenance of CockroachDB clusters, and AI-assisted development of applications that are built on CockroachDB.

### CockroachDB Cloud MCP server

The CockroachDB Cloud MCP server is a managed endpoint in CockroachDB Cloud that exposes a set of tools for inspecting and querying your clusters from your AI tools. These tools let your AI assistants list [databases]({% link {{ page.version.version }}/show-databases.md %}) and [tables]({% link {{ page.version.version }}/show-tables.md %}), describe [schemas]({% link {{ page.version.version }}/show-schemas.md %}) and [indexes]({% link {{ page.version.version }}/show-index.md %}), inspect cluster health and running queries, and run read-only SQL and [`EXPLAIN`]({% link {{ page.version.version }}/explain.md %}) statements. When explicitly enabled, they can also [create databases]({% link {{ page.version.version }}/create-database.md %}), [create tables]({% link {{ page.version.version }}/create-table.md %}), and [insert rows]({% link {{ page.version.version }}/insert.md %}).

This access allows you to manage and modify a CockroachDB Cloud cluster using natural language prompts. For example, you could use your AI tool to do the following:

```
List all of the tables in the movr database.
If there are no tables, create one called "inventory" with columns for id, product_name, quantity, and last_updated.
```

### Agent Skills for CockroachDB

[Agent Skills for CockroachDB]({% link {{ page.version.version }}/agent-skills.md %}) are small, structured capabilities that encode CockroachDB operational expertise in a machine-executable format. They live in the public `cockroachdb-skills` repository and follow the [Agent Skills Specification](https://agentskills.io/specification), with defined inputs, outputs, and safety guardrails.

Each skill focuses on a specific task, such as auditing user privileges, triaging live SQL activity, validating production readiness, or checking backup and disaster recovery posture. Skills link back to the relevant CockroachDB documentation rather than duplicating it. They are organized into domains like onboarding and migrations, application development, performance and scaling, operations and lifecycle, resilience and disaster recovery, observability and diagnostics, security and governance, integrations, and cost management.

Your AI agents and IDE integrations can consume these skills directly, so you can reuse the same operational workflows across different toolchains.

### `ccloud` command-line interface

The [`ccloud` CLI]({% link cockroachcloud/ccloud-get-started.md %}) is the command-line interface for CockroachDB Cloud. With a single binary, you can install `ccloud` and then create clusters, manage networking (for example, IP allowlists), create SQL users, and retrieve connection information. Commands such as `ccloud quickstart`, `ccloud cluster create`, `ccloud cluster sql`, and `ccloud cluster delete` cover the core lifecycle of CockroachDB Cloud clusters.

Because `ccloud` is text-based and follows a stable command structure, it works well as a surface for AI tools and automations. An AI assistant can generate or run `ccloud` commands to set up clusters, rotate credentials, or retrieve connection URLs, while you keep access mediated through the CLI and existing Cloud authentication.

### CockroachDB Docs MCP server

The [CockroachDB Docs MCP server]({% link {{ page.version.version }}/docs-mcp-integration.md %}) exposes the published CockroachDB documentation to your MCP-compatible tools over HTTP. After you add the server configuration to your client, your AI assistant can answer questions using the official docs without leaving your editor—for example, how to configure [multi-region clusters]({% link {{ page.version.version }}/multiregion-overview.md %}), [tune queries]({% link {{ page.version.version }}/performance-best-practices-overview.md %}), or set up [TLS]({% link {{ page.version.version }}/security-reference/transport-layer-security.md %}) and [RBAC]({% link {{ page.version.version }}/security-reference/authorization.md %}).

This integration only provides access to CockroachDB product documentation. It does not connect to your clusters or data. It is intended to give your AI tools reliable product information while you develop and operate CockroachDB and CockroachDB Cloud. For example, you could use your AI tool to ask the following:

```
How do table statistics get refreshed in CockroachDB?
```

## CockroachDB as a data store for AI applications

CockroachDB provides the database features needed to store and query AI-related data, including agent state, with the same transactional guarantees as your other workloads.

### AI agent state and workflow coordination

AI agents that perform autonomous operations require durable storage for execution state, workflow metadata, and operational history. These agents must track state transitions across multi-step processes, coordinate activities between concurrent executions, and ensure that operations can be safely retried or resumed after failures.

CockroachDB's [transactional model]({% link {{ page.version.version }}/transactions.md %}) provides a foundation for storing agent state, execution history, and coordination metadata. [Serializable isolation]({% link {{ page.version.version }}/demo-serializable.md %}) ensures that state transitions occur correctly even when multiple agents or processes attempt concurrent updates. The database's [high availability]({% link {{ page.version.version }}/frequently-asked-questions.md %}#how-does-cockroachdb-survive-failures) design allows agents to continue operating during node or region failures without requiring external coordination services.

### Scale, consistency, and governance

AI applications typically generate high data volumes, serve globally distributed users, and require both transactional correctness and operational durability. Conversation histories, feature tables, and agent state accumulate quickly and are accessed across regions. These characteristics make AI workloads well-suited to CockroachDB's core design:

- CockroachDB scales horizontally by adding nodes to increase capacity. 
- Data is automatically replicated and rebalanced across the cluster and node failures do not require application-level failover. 
- [Multi-region deployments]({% link {{ page.version.version }}/multiregion-overview.md %}) place data closer to users and can enforce [data locality]({% link {{ page.version.version }}/regional-tables.md %}) or residency requirements while maintaining strong consistency.

CockroachDB provides [serializable transactions]({% link {{ page.version.version }}/demo-serializable.md %}) by default, ensuring that all data operations maintain consistency.

## See also

- [How CockroachDB's AI Assistance Boosts Developer Productivity](https://www.cockroachlabs.com/blog/cockroachdb-ai-assistance-for-developers/)
- [Agent Development with CockroachDB using the LangChain Framework](https://www.cockroachlabs.com/blog/agent-development-cockroachdb-langchain/)
- [CockroachDB Plugin for Claude Code](https://github.com/cockroachdb/claude-plugin)
- [CockroachDB Plugin for Cursor](https://github.com/cockroachdb/cursor-plugin)
