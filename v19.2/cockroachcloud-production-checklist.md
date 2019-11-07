---
title: Production Checklist
summary: Learn how to move from testing to production on your CockroachCloud cluster.
toc: true
build_for: [cockroachcloud]
---

This page provides important recommendations for CockroachCloud production deployments.

## Verify hardware selection

<Link to testing hardware selection doc>

## SQL Best Practices

To ensure optimal SQL performance for your CockroachCloud cluster, follow the best practices described in the [SQL Performance Best Practices](performance-best-practices-overview.html) guide.

### Connection pooling

Reducing the number of connections more than most ppl think.
https://github.com/brettwooldridge/HikariCP/wiki/About-Pool-Sizing
Reduce concurrency to improve throughput. Especially imp if people don’t have persistent connections.
Use min number of connections you can in order to make your application run.
Number of connection size = (number of nodes * number of cores) - 1

## Security Best Practices

### Authorizing the right network

### Password verification for SQL database. Note: Password verification is CPU-heavy
