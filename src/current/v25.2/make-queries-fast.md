---
title: Optimize Statement Performance Overview
summary: How to make your statements run faster during application development.
toc: true
docs_area: develop
---

This page provides an overview for optimizing statement performance in CockroachDB. To get good performance, you need to look at how you're accessing the database through several lenses:

- [SQL statement performance](#sql-statement-performance-rules): This is the most common cause of performance problems and where you should start.
- [Schema design](#schema-design): Depending on your SQL schema and the data access patterns of your workload, you may need to make changes to avoid creating [transaction contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention) or [hotspots]({% link {{ page.version.version }}/understand-hotspots.md %}).
- [Cluster topology](#cluster-topology): As a distributed system, CockroachDB requires you to trade off latency vs. resiliency. This requires choosing the right cluster topology for your needs.

## SQL statement performance rules

To get good SQL statement performance, follow these rules:

- [Rule 1. Scan as few rows as possible]({% link {{ page.version.version }}/apply-statement-performance-rules.md %}#rule-1-scan-as-few-rows-as-possible). If your application is scanning more rows than necessary for a given statement, it's going to be difficult to scale.
- [Rule 2. Use the right index]({% link {{ page.version.version }}/apply-statement-performance-rules.md %}#rule-2-use-the-right-index). Your statement should use an index on the columns in the `WHERE` clause. You want to avoid the performance hit of a full table scan.
- [Rule 3. Use the right join type]({% link {{ page.version.version }}/apply-statement-performance-rules.md %}#rule-3-use-the-right-join-type). Depending on the relative sizes of the tables you are querying, the type of [join]({% link {{ page.version.version }}/joins.md %}) may be important. You should only rarely need to specify the join type because the [cost-based optimizer]({% link {{ page.version.version }}/cost-based-optimizer.md %}) should pick the best-performing join type if you add the right indexes as described in Rule 2. However, in some circumstances you may want to specify a [join hint]({% link {{ page.version.version }}/cost-based-optimizer.md %}#join-hints).

These rules apply to an environment where thousands of [OLTP](https://wikipedia.org/wiki/Online_transaction_processing) statements are being run per second, and each statement needs to run in milliseconds. These rules are not intended to apply to analytical, or [OLAP](https://wikipedia.org/wiki/Online_analytical_processing), statements.

For an example of applying the rules to a query, see [Apply SQL Statement Performance Rules]({% link {{ page.version.version }}/apply-statement-performance-rules.md %}).

## Schema design

If you are following the instructions in [the SQL performance section](#sql-statement-performance-rules) and still not getting the performance you want, you may need to look at your schema design and data access patterns to make sure that you are not:

- Introducing transaction contention. For methods for diagnosing and mitigating transaction contention, see [Transaction contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention).
- Creating hotspots in your cluster. For methods for detecting and eliminating hotspots, refer to [Understand hotspots]({% link {{ page.version.version }}/understand-hotspots.md %}#).

## Cluster topology

It's very important to make sure that the cluster topology you are using is the right one for your use case. Because CockroachDB is a distributed system that involves nodes communicating over the network, you need to choose the cluster topology that results in the right latency vs. resiliency tradeoff.

For more information about how to choose the cluster topology that is right for your application, see [Topology Patterns Overview]({% link {{ page.version.version }}/topology-patterns.md %}).

## See also

### Tasks

- [Statement Tuning with `EXPLAIN`]({% link {{ page.version.version }}/sql-tuning-with-explain.md %})
- [Troubleshoot SQL Behavior]({% link {{ page.version.version }}/query-behavior-troubleshooting.md %})
- [Troubleshoot SQL Statements]({% link {{ page.version.version }}/query-behavior-troubleshooting.md %})

### Reference

- [SQL Performance Best Practices]({% link {{ page.version.version }}/performance-best-practices-overview.md %})
- [Performance Recipes]({% link {{ page.version.version }}/performance-recipes.md %})
- [Topology Patterns]({% link {{ page.version.version }}/topology-patterns.md %})
