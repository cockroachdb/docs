---
title: Insights Page
summary: The Insights page exposes problems that CockroachDB has detected in your workloads and schemas.
toc: true
docs_area: reference.db_console
---


The **Insights** page exposes problems that CockroachDB has detected in your workloads and schemas. The page also offers recommendations to improve the performance of your workloads. These are called *insights* in the DB Console.

The **Insights** page helps you:

- Identify SQL statements with [high retry counts]({{ page.version.version }}/transactions.md#automatic-retries), [slow execution]({{ page.version.version }}/query-behavior-troubleshooting.md#identify-slow-queries), or [suboptimal plans]({{ page.version.version }}/cost-based-optimizer.md).
- Identify [indexes]({{ page.version.version }}/indexes.md) that should be created, altered, replaced, or dropped to improve performance.


## See also

- [Statements page]({{ page.version.version }}/ui-statements-page.md)
- [Transactions page]({{ page.version.version }}/ui-transactions-page.md)
- [Databases page]({{ page.version.version }}/ui-databases-page.md)
- [Assign privileges]({{ page.version.version }}/security-reference/authorization.md#managing-privileges)