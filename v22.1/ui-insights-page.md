---
title: Insights Page
summary: The Insights page exposes problems that CockroachDB has detected in your workloads and schemas and offers recommendations to improve the performance of your workloads.
toc: true
docs_area: reference.db_console
---

{% include {{ page.version.version }}/ui/admin-access.md %}

The **Insights** page helps you:

- Identify SQL statements with [high retry counts](transactions.html#automatic-retries), [slow execution](query-behavior-troubleshooting.html#identify-slow-queries), or [suboptimal plans](cost-based-optimizer.html).
- Identify [indexes](indexes.html) that should be created, altered, replaced, or dropped to improve performance.

This feature is under development.
