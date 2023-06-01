---
title: Insights Page
summary: The Insights page exposes problems that CockroachDB has detected in your workloads and schemas.
toc: true
docs_area: reference.db_console
---

{% include {{ page.version.version }}/ui/admin-access.md %}

{% include_cached new-in.html version="v22.2" %} The **Insights** page exposes problems that CockroachDB has detected in your workloads and schemas. The page also offers recommendations to improve the performance of your workloads. These are called *insights* in the DB Console.

The **Insights** page helps you:

- Identify SQL statements with [high retry counts](transactions.html#automatic-retries), [slow execution](query-behavior-troubleshooting.html#identify-slow-queries), or [suboptimal plans](cost-based-optimizer.html).
- Identify [indexes](indexes.html) that should be created, altered, replaced, or dropped to improve performance.

{% include {{ page.version.version }}/ui/insights.md %}

## See also

- [Statements page](ui-statements-page.html)
- [Transactions page](ui-transactions-page.html)
- [Databases page](ui-databases-page.html)
- [Assign privileges](security-reference/authorization.html#managing-privileges)
