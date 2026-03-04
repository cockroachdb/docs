---
title: Agent Skills for CockroachDB
summary: Learn about the CockroachDB Agent Skills Git repository and how to use or contribute to it
toc: true
docs_area: ai_tools
---

Cockroach Labs provides a public [cockroachdb-skills](https://github.com/cockroachlabs/cockroachdb-skills) repository with a curated collection of Agent Skills for CockroachDB. These skills encode operational expertise so AI agents, automation systems, and developer tools can deliver production-grade CockroachDB operations.

## What is a CockroachDB Agent Skill?

A CockroachDB Agent Skill:

- Encodes operational expertise for a specific task or workflow.
- Follows the [Agent Skills Specification](https://agentskills.io/specification).
- Is machine-executable, with clear inputs, outputs, and safety guardrails.
- Links to authoritative CockroachDB documentation rather than duplicating it.

Skills live under [the repository's `skills/` directory](https://github.com/cockroachlabs/cockroachdb-skills/tree/main/skills).

## Skill domains

Skills are organized into the following operational domains:

- Onboarding and migrations
- Application development
- Performance and scaling
- Operations and lifecycle
- Resilience and Disaster Recovery (DR)
- Observability and Diagnostics
- Security and Governance
- Integrations and Ecosystem
- Cost and usage management

## See also

- [AI Tools Overview]({% link {{ page.version.version }}/ai-tools-overview.md %})
- [CockroachDB Docs MCP Server]({% link {{ page.version.version }}/docs-mcp-integration.md %})
- [CockroachDB Skills repository](https://github.com/cockroachlabs/cockroachdb-skills)
