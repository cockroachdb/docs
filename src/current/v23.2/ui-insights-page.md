---
title: Insights Page
summary: The Insights page exposes problems that CockroachDB has detected in your workloads and schemas.
toc: true
docs_area: reference.db_console
---

{% include {{ page.version.version }}/ui/admin-access.md %}

The **Insights** page exposes problems that CockroachDB has detected in your workloads and schemas. The page also offers recommendations to improve the performance of your workloads. These are called *insights* in the DB Console.

The **Insights** page helps you:

- Identify SQL statements with [high retry counts]({% link {{ page.version.version }}/transactions.md %}#automatic-retries), [slow execution]({% link {{ page.version.version }}/query-behavior-troubleshooting.md %}#identify-slow-queries), or [suboptimal plans]({% link {{ page.version.version }}/cost-based-optimizer.md %}).
- Identify [indexes]({% link {{ page.version.version }}/indexes.md %}) that should be created, altered, replaced, or dropped to improve performance.

{% include {{ page.version.version }}/ui/insights.md %}

## See also

- [Statements page]({% link {{ page.version.version }}/ui-statements-page.md %})
- [Transactions page]({% link {{ page.version.version }}/ui-transactions-page.md %})
- [Databases page]({% link {{ page.version.version }}/ui-databases-page.md %})
- [Assign privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges)
